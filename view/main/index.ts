let expand = document.querySelector<HTMLButtonElement>('.main_expand')!

function onScroll(): void {
  document.body.classList.add('is-main-collapsed')
  window.removeEventListener('scroll', onScroll)
}

function init(): void {
  window.addEventListener('scroll', onScroll)
}

let mobile = window.matchMedia('(max-width:830px)')
if (mobile.matches) {
  init()
} else {
  mobile.addEventListener('change', () => {
    init()
  })
}

expand.addEventListener('click', () => {
  document.body.classList.toggle('is-main-collapsed')
})
