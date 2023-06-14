import * as K from 'kefir'

export function simpleCounter() {
  const sAdd = K.fromEvents(document.querySelector('button[name=add]'), 'click').map(() => 1)

  const sSub = K.fromEvents(document.querySelector('button[name=sub]'), 'click').map(() => -1)

  const sDelta = K.merge([sAdd, sSub])

  const result = sDelta.scan((acc, v) => acc + v, 0)

  result.onValue((v) => {
    document.getElementById('val').innerHTML = v
  })
}
