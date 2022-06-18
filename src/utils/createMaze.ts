export const Direction = {
  Top: 0,
  Right: 1,
  Bottom: 2,
  Left: 3,
}

interface MazeMap {
  [key: number]: Block[]
}

export interface Block {
  x: number
  y: number
  color: string
  wall: boolean[]
}

// 采用 建墙策略 生成迷宫
export function createMaze(mapSize: { height: number; width: number }) {
  const mazeMap = Array.from({ length: mapSize.height }, (_, y) => {
    return Array.from({ length: mapSize.width }, (_, x) => {
      return {
        x,
        y,
        color: '#000',
        wall: Array.from({ length: 4 }, () => false),
      }
    })
  })
  for (let i = 0; i < mapSize.height; i++) {
    mazeMap[i][0].wall[Direction.Left] = true
    mazeMap[i][mapSize.width - 1].wall[Direction.Right] = true
  }

  for (let i = 0; i < mapSize.width; i++) {
    mazeMap[0][i].wall[Direction.Top] = true
    mazeMap[mapSize.height - 1][i].wall[Direction.Bottom] = true
  }

  mazeMap[0][0].wall[Direction.Left] = false
  const randomEndCoord = Math.floor(mapSize.width / 2 + Math.random() * mapSize.width / 2)
  mazeMap[mapSize.height - 1][randomEndCoord].wall[Direction.Bottom] = false

  function getMidIndex(start: number, end: number) {
    if (start > end)
      [start, end] = [end, start]
    return Math.floor(Math.random() * (end - start) + start)
  }

  const initMaze = (mazeArr: MazeMap, startX: number, startY: number, endX: number, endY: number) => {
    if (endX - startX < 2 || endY - startY < 2)
      return

    const midX = getMidIndex(startX + 1, endX)
    const midY = getMidIndex(startY + 1, endY)
    const closedLineIndex = Math.floor(Math.random() * 4)
    const opens = []
    for (let i = 0; i < 2; i++) {
      const openX = getMidIndex(
        i === 0 ? startX : midX,
        i === 0 ? midX : endX,
      )
      opens.push({ isX: true, openX, openY: midY })
    }
    for (let i = 0; i < 2; i++) {
      const openY = getMidIndex(
        i === 0 ? startY : midY,
        i === 0 ? midY : endY,
      )
      opens.push({ isX: false, openX: midX, openY })
    }

    for (let x = startX; x < endX; x++) {
      if (mazeArr[midY - 1])
        mazeArr[midY - 1][x].wall[Direction.Bottom] = true
      mazeArr[midY][x].wall[Direction.Top] = true
    }
    for (let y = startY; y < endY; y++) {
      if (mazeArr[y][midX - 1])
        mazeArr[y][midX - 1].wall[Direction.Right] = true
      mazeArr[y][midX].wall[Direction.Left] = true
    }

    for (let index = 0; index < opens.length; index++) {
      if (index === closedLineIndex)
        continue
      const { openX, openY, isX } = opens[index]
      if (isX) {
        mazeArr[openY - 1][openX].wall[Direction.Bottom] = false
        mazeArr[openY][openX].wall[Direction.Top] = false
      }
      if (!isX) {
        mazeArr[openY][openX - 1].wall[Direction.Right] = false
        mazeArr[openY][openX].wall[Direction.Left] = false
      }
    }

    initMaze(mazeArr, startX, startY, midX, midY)
    initMaze(mazeArr, startX, midY, midX, endY)
    initMaze(mazeArr, midX, midY, endX, endY)
    initMaze(mazeArr, midX, startY, endX, midY)
  }

  initMaze(mazeMap, 0, 0, mapSize.width, mapSize.height)
  return mazeMap.flat(2)
}
