import * as K from 'kefir'
import { simpleCounter } from './simple-counter'

/* Resources:
- [Implementing Snake in Bacon.js](http://philipnilsson.github.io/badness/)
  Learnt about using functions as stream values
-
*/

function canvas() {
  const c = document.querySelector('canvas')
  const ctx = c.getContext('2d')
  c.width = c.clientWidth
  c.height = c.clientHeight

  const rect = c.getBoundingClientRect()

  const toXY = (e) => ({
    x: e.clientX - rect.left, // * (c.width / rect.width),
    y: e.clientY - rect.top, //  * (c.height / rect.height),
  })

  const drawLine = ([start, end]) => {
    if (start == null || end == null) return

    ctx.clearRect(0, 0, c.width, c.height)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    ctx.restore()
  }

  const drawRect = ([start, end]) => {
    if (start == null || end == null) return

    ctx.clearRect(0, 0, c.width, c.height)
    ctx.save()
    ctx.fillStyle = 'hsla(32.9, 100%, 90%, 0.8)'
    ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y)
    ctx.restore()
  }

  const sPointerDown = K.fromEvents(c, 'pointerdown').map(toXY)
  const sPointerMove = K.fromEvents(c, 'pointermove').map(toXY)
  const sPointerUp = K.fromEvents(c, 'pointerup').map(toXY)

  sPointerDown
    .flatMap((down) => sPointerMove.scan(([start], next) => [start, next], [down, null]).takeUntilBy(sPointerUp))
    .onValue(drawRect)

  sPointerDown
    .flatMapLatest((down) => sPointerUp.scan(([start], next) => [start, next], [down, null]))
    .onValue(drawLine)
}

function box() {
  const container = document.getElementById('click-n-drag')
  const containerSize = container.getBoundingClientRect()
  const box = container.querySelector('div.box')
  const boxSize = box.getBoundingClientRect()
  const maxTopValue = containerSize.height - boxSize.height
  const maxLeftValue = containerSize.width - boxSize.width

  const sBoxPointerDown = K.fromEvents(box, 'pointerdown')
  const sPointerMove = K.fromEvents(container, 'pointermove')
  const sPointerUp = K.fromEvents(container, 'pointerup')

  const isSelected = sBoxPointerDown.merge(sPointerUp).scan((prev) => !prev, false)

  isSelected.onValue((isSelected) =>
    isSelected ? box.classList.add('selected-box') : box.classList.remove('selected-box'),
  )

  sBoxPointerDown
    .flatMap(() => sPointerMove.takeUntilBy(sPointerUp))
    .onValue((e) => {
      const size = e.target.getBoundingClientRect()

      const offsetX = e.clientX - size.left
      const offsetY = e.clientY - size.top

      const x = size.left - containerSize.left + offsetX
      const y = size.top - containerSize.top + offsetY

      // Kinda work
      // @FIXME: Make the box to move only within the container boundary
      box.style.left = Math.min(x, maxLeftValue) + 'px'
      box.style.top = Math.min(y, maxTopValue) + 'px'
    })
}

simpleCounter()
canvas()
box()
