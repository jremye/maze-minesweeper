<script setup lang="ts">
import { createMaze } from '../utils/createMaze.js'
const Direction = {
  Top: 0,
  Right: 1,
  Bottom: 2,
  Left: 3,
}

const Vector = {
  [Direction.Top]: [0, -1],
  [Direction.Right]: [1, 0],
  [Direction.Bottom]: [0, 1],
  [Direction.Left]: [-1, 0],
}

interface Block {
  x: number
  y: number
  color: string
  wall: boolean[]
}

const mapSize = { width: 20, height: 20 }
const blockSize = { width: 30, height: 30 }

// const initBlocks = (): Block[] => Array.from({ length: mapSize.width * mapSize.height }).map((_, index) => ({
//   x: (index + 1) % mapSize.width,
//   y: Math.floor((index + 1) / mapSize.width) + 1,
//   color: '#000',
//   wall: Array.from({ length: 4 }, () => true),
// }))

// const blocks = reactive<Block[]>(initBlocks())

const blocks = reactive<Block[]>(createMaze(mapSize))
const getBlock = (coord: { x: number; y: number }): Block => blocks[coord.x - 1 + (coord.y - 1) * mapSize.width]
const start = reactive({ x: 1, y: 1 })

const move = (direction: number) => {
  const block = getBlock(start)
  const next = { x: start.x + Vector[direction][0], y: start.y + Vector[direction][1] }

  if (next.x < 1 || next.x > mapSize.width || next.y < 1 || next.y > mapSize.height)
    return

  Object.assign(start, next)

  block.wall[direction] = false
  getBlock(next).wall[(direction + 2) % 4] = false
}
let moving = $ref(false)
let timer: NodeJS.Timeout | undefined
let pressedKey: string | null = null
window.addEventListener('keyup', () => {
  clearTimeout(timer)
  pressedKey = null
  timer = undefined
})
window.addEventListener('keydown', ({ key }) => {
  if (pressedKey && pressedKey !== key)
    return
  if (moving && !pressedKey)
    return

  let dirction = null
  switch (key) {
    case 'ArrowUp':
      dirction = Direction.Top
      break
    case 'ArrowRight':
      dirction = Direction.Right
      break
    case 'ArrowDown':
      dirction = Direction.Bottom
      break
    case 'ArrowLeft':
      dirction = Direction.Left
      break
  }

  if (dirction !== null) {
    if (!timer) {
      timer = setTimeout(() => {
        pressedKey = key
      }, 100)
    }
    moving = true
    move(dirction)
    setTimeout(() => {
      moving = false
    }, pressedKey ? 100 : 15)
  }
})
</script>

<template>
  <div flex="~ gap-xl" justify="center">
    <button v-for="dirction in Object.keys(Direction)" :key="dirction" @click="move(Direction[dirction as keyof typeof Direction])">
      {{ dirction }}
    </button>
  </div>
  <h3>{{ start }}</h3>
  <div class="maze-minesweeper" flex="~ col gap-0" items-center>
    <div select-none relative>
      <div v-for="y in mapSize.height" :key="y" flex="~ gap-0">
        <div
          v-for="x in mapSize.width"
          :key="x"
          p-5px
          border="~ gray-500/20"
          flex="~"
          justify-center
          items-center
          :style="{ width: `${blockSize.width}px`, height: `${blockSize.height}px` }"
          :class="{
            'border-t-orange-500/50': getBlock({ x, y }).wall[Direction.Top],
            'border-r-orange-500/50': getBlock({ x, y }).wall[Direction.Right],
            'border-b-orange-500/50': getBlock({ x, y }).wall[Direction.Bottom],
            'border-l-orange-500/50': getBlock({ x, y }).wall[Direction.Left],
          }"
        />
      </div>
      <div
        absolute
        left-0
        top-0 text-center
        transition="duration-120"
        class="bg-orange-500/40"
        :style="{
          transform: `translate(${(start.x - 1) * blockSize.width}px, ${(start.y - 1) * blockSize.height}px)`,
          width: `${blockSize.width}px`,
          height: `${blockSize.height}px`,
          lineHeight: `${blockSize.height}px`,
          fontSize: `${Math.min(blockSize.width, blockSize.height) / 2}px`,
        }"
      >
        😈
      </div>
    </div>
  </div>
</template>
