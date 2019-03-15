import { asyncCommand, asyncCacheItem } from '../AsyncResult'
import { awaitingResult, resultReceived } from '../CacheItem'
import { toSyncStateProps } from '../toSyncStateProps'
import { None, none } from '../None'

describe('toSyncStateProps', () => {
  it('should return (part of the) props and commands', () => {
    enum Commands {
      GetMonkey,
      FetchMule
    }
    type GetMonkeyCommand = { type: Commands.GetMonkey }
    type FetchMuleCommand = { type: Commands.FetchMule }
    type Command = GetMonkeyCommand | FetchMuleCommand

    type AsyncStateProps = {
      monkey: boolean
      hare: number
      mule: object
      platipus: string
    }

    const asyncStateProps = {
      monkey: asyncCommand<GetMonkeyCommand>({ type: Commands.GetMonkey }),
      hare: asyncCacheItem<number, number, number>(awaitingResult(1, 'request-1', 100)),
      mule: asyncCommand<FetchMuleCommand>({ type: Commands.FetchMule }),
      platipus: asyncCacheItem<number, string, number>(resultReceived(2, 'P-p-p-platipus', 200))
    }

    const [syncStatePropsToVerify, commandsToVerify] = toSyncStateProps<Command, AsyncStateProps>(asyncStateProps)

    const expectedSyncStateProps: { [K in keyof AsyncStateProps]: AsyncStateProps[K] | None } = {
      monkey: none,
      hare: none,
      mule: none,
      platipus: 'P-p-p-platipus'
    }
    const expectedCommands: Command[] = [{ type: Commands.GetMonkey }, { type: Commands.FetchMule }]

    expect(syncStatePropsToVerify).toEqual(expectedSyncStateProps)
    expect(commandsToVerify).toEqual(expect.arrayContaining(expectedCommands))
  })
})
