import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import { manual, sources } from '../meta.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function exec(cmd: string, cwd = root): string {
  return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim()
}

function execSafe(cmd: string, cwd = root): string | null {
  try {
    return exec(cmd, cwd)
  }
  catch {
    return null
  }
}

interface Project {
  name: string
  url: string
  path: string
}

function getProjects(): Project[] {
  return Object.entries(sources).map(([name, url]) => ({
    name,
    url,
    path: join('sources', name),
  }))
}

function isCloned(project: Project): boolean {
  return existsSync(join(root, project.path, '.git'))
}

function getExistingSourceNames(): string[] {
  const dir = join(root, 'sources')
  if (!existsSync(dir))
    return []
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

function getExtraSources(): string[] {
  const expected = new Set(Object.keys(sources))
  return getExistingSourceNames().filter(name => !expected.has(name))
}

/**
 * Clone missing sources. Uses a blob-less partial clone: full history (needed
 * for `git diff <sha>..HEAD`) while file contents are fetched lazily.
 */
async function initSources(skipPrompt = false) {
  const spinner = p.spinner()
  const allProjects = getProjects()
  const newProjects = allProjects.filter(project => !isCloned(project))

  if (newProjects.length === 0) {
    p.log.info('All sources already cloned')
    return
  }

  const selected = skipPrompt
    ? newProjects
    : await p.multiselect({
        message: 'Select projects to clone',
        options: newProjects.map(project => ({
          value: project,
          label: project.name,
          hint: project.url,
        })),
        initialValues: newProjects,
      })

  if (p.isCancel(selected)) {
    p.cancel('Cancelled')
    return
  }

  mkdirSync(join(root, 'sources'), { recursive: true })

  for (const project of selected as Project[]) {
    spinner.start(`Cloning: ${project.name}`)
    try {
      const target = join(root, project.path)
      // Remove leftovers from an interrupted clone or an empty submodule dir
      rmSync(target, { recursive: true, force: true })
      exec(`git clone --filter=blob:none ${project.url} ${project.path}`)
      spinner.stop(`Cloned: ${project.name}`)
    }
    catch (e) {
      spinner.stop(`Failed to clone ${project.name}: ${e}`)
    }
  }

  p.log.success('Sources cloned')
}

async function syncSources() {
  const spinner = p.spinner()
  const cloned = getProjects().filter(isCloned)

  if (cloned.length === 0) {
    p.log.warn('No sources cloned yet, run `init` first')
    return
  }

  for (const project of cloned) {
    spinner.start(`Syncing: ${project.name}`)
    try {
      const cwd = join(root, project.path)
      exec('git fetch --tags --force origin', cwd)
      // Sources are read-only references, so always match the remote default branch
      exec('git remote set-head origin --auto', cwd)
      exec('git reset --hard origin/HEAD', cwd)
      spinner.stop(`Synced: ${project.name} @ ${exec('git rev-parse --short HEAD', cwd)}`)
    }
    catch (e) {
      spinner.stop(`Failed to sync ${project.name}: ${e}`)
    }
  }

  p.log.success('All sources synced')
}

async function checkUpdates() {
  const spinner = p.spinner()
  const updates: { name: string, behind: number }[] = []

  for (const project of getProjects().filter(isCloned)) {
    spinner.start(`Fetching: ${project.name}`)
    const cwd = join(root, project.path)
    try {
      exec('git fetch origin', cwd)
      spinner.stop(`Fetched: ${project.name}`)
    }
    catch (e) {
      spinner.stop(`Failed to fetch ${project.name}: ${e}`)
      continue
    }

    const behind = execSafe('git rev-list HEAD..origin/HEAD --count', cwd)
    const count = behind ? Number.parseInt(behind) : 0
    if (count > 0)
      updates.push({ name: project.name, behind: count })
  }

  if (updates.length === 0) {
    p.log.success('All sources are up to date')
  }
  else {
    p.log.info('Updates available:')
    for (const update of updates)
      p.log.message(`  ${update.name}: ${update.behind} commits behind`)
  }
}

function getExpectedSkillNames(): Set<string> {
  const expected = new Set<string>()

  // Skills from sources (generated skills use same name as the source key)
  for (const name of Object.keys(sources)) {
    expected.add(name)
  }

  // Manual skills
  for (const name of manual) {
    expected.add(name)
  }

  return expected
}

function getExistingSkillNames(): string[] {
  const skillsDir = join(root, 'skills')
  if (!existsSync(skillsDir))
    return []

  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}

async function cleanup(skipPrompt = false) {
  const spinner = p.spinner()
  let hasChanges = false

  // 1. Find and remove extra sources
  const extraSources = getExtraSources()

  if (extraSources.length > 0) {
    p.log.warn(`Found ${extraSources.length} source(s) not in meta.ts:`)
    for (const name of extraSources)
      p.log.message(`  - sources/${name}`)

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra sources?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const name of extraSources) {
        spinner.start(`Removing source: ${name}`)
        try {
          rmSync(join(root, 'sources', name), { recursive: true, force: true })
          spinner.stop(`Removed: sources/${name}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove sources/${name}: ${e}`)
        }
      }
    }
  }

  // 2. Find and remove extra skills
  const existingSkills = getExistingSkillNames()
  const expectedSkills = getExpectedSkillNames()
  const extraSkills = existingSkills.filter(name => !expectedSkills.has(name))

  if (extraSkills.length > 0) {
    p.log.warn(`Found ${extraSkills.length} skill(s) not in meta.ts:`)
    for (const name of extraSkills) {
      p.log.message(`  - skills/${name}`)
    }

    const shouldRemove = skipPrompt
      ? true
      : await p.confirm({
          message: 'Remove these extra skills?',
          initialValue: true,
        })

    if (p.isCancel(shouldRemove)) {
      p.cancel('Cancelled')
      return
    }

    if (shouldRemove) {
      hasChanges = true
      for (const skillName of extraSkills) {
        spinner.start(`Removing skill: ${skillName}`)
        try {
          rmSync(join(root, 'skills', skillName), { recursive: true })
          spinner.stop(`Removed: skills/${skillName}`)
        }
        catch (e) {
          spinner.stop(`Failed to remove skills/${skillName}: ${e}`)
        }
      }
    }
  }

  if (!hasChanges && extraSources.length === 0 && extraSkills.length === 0) {
    p.log.success('Everything is clean, no unused sources or skills found')
  }
  else if (hasChanges) {
    p.log.success('Cleanup completed')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipPrompt = args.includes('-y') || args.includes('--yes')
  const command = args.find(arg => !arg.startsWith('-'))

  // Handle subcommands directly
  if (command === 'init') {
    p.intro('Skills Manager - Init')
    await initSources(skipPrompt)
    p.outro('Done')
    return
  }

  if (command === 'sync') {
    p.intro('Skills Manager - Sync')
    await syncSources()
    p.outro('Done')
    return
  }

  if (command === 'check') {
    p.intro('Skills Manager - Check')
    await checkUpdates()
    p.outro('Done')
    return
  }

  if (command === 'cleanup') {
    p.intro('Skills Manager - Cleanup')
    await cleanup(skipPrompt)
    p.outro('Done')
    return
  }

  // No subcommand: show interactive menu (requires interaction)
  if (skipPrompt) {
    p.log.error('Command required when using -y flag')
    p.log.info('Available commands: init, sync, check, cleanup')
    process.exit(1)
  }

  p.intro('Skills Manager')

  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'sync', label: 'Sync sources', hint: 'Pull latest source docs' },
      { value: 'init', label: 'Clone sources', hint: 'Clone missing sources' },
      { value: 'check', label: 'Check updates', hint: 'See available updates' },
      { value: 'cleanup', label: 'Cleanup', hint: 'Remove unused sources and skills' },
    ],
  })

  if (p.isCancel(action)) {
    p.cancel('Cancelled')
    process.exit(0)
  }

  switch (action) {
    case 'init':
      await initSources()
      break
    case 'sync':
      await syncSources()
      break
    case 'check':
      await checkUpdates()
      break
    case 'cleanup':
      await cleanup()
      break
  }

  p.outro('Done')
}

main().catch(console.error)
