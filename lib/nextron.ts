import { Command } from 'commander'
import { devCommand } from './nextron-dev'
import { buildCommand } from './nextron-build'

const program = new Command()

program.name('nextron').description('⚡ Next.js + Electron ⚡')
program.addCommand(devCommand, { isDefault: true })
program.addCommand(buildCommand)

program.parse(process.argv)
