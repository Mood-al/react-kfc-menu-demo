import React from 'react'
import { debounce } from '@/utils/debounce'

const Menu = ({
  children,
  activeBlock,
  onBlockIntersection = () => null,
  containerClassName = '',
  indicatorClassName = '',
  indicatorTopPostion = 80,
  showIndicator = false,
  scrollBahavior = 'auto',
  action,
}) => {
  const blockRef = React.useRef([])
  const indicatorRef = React.useRef(null)

  let prev = null
  const handleScroll = debounce((event) => {
    if (!indicatorRef.current) return
    const indicatorRects = indicatorRef.current?.getBoundingClientRect()

    const element = document
      ?.elementsFromPoint(indicatorRects?.x, indicatorRects?.y)
      .find((item) => item.classList.contains('rkm___block___container'))
    let id = element?.getAttribute('data-id') || activeBlock

    if (prev !== id) {
      console.log(id)
      onBlockIntersection(event, +id)
    }

    prev = id
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (activeBlock) {
      scrollSelectedToBlock(activeBlock)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollSelectedToBlock = (index) => {
    const blockRects = blockRef.current[index].getBoundingClientRect()

    const blockToTopGap =
      document.documentElement.scrollTop +
      blockRef.current[0].getBoundingClientRect().top

    window.scrollTo({
      top:
        document.documentElement.scrollTop +
        blockRects.top -
        indicatorTopPostion,

      behavior: scrollBahavior,
    })
  }
  React.useImperativeHandle(
    action,
    () => ({
      scrollSelectedToBlock,
    }),
    [scrollSelectedToBlock],
  )

  return (
    <div className={`${containerClassName || ''}`}>
      <div
        className={indicatorClassName}
        ref={indicatorRef}
        style={{
          position: 'fixed',
          top: indicatorTopPostion,
          zIndex: '-1',
          ...(showIndicator && {
            height: 4,
            background: 'red',
            zIndex: '99',
            width: '100%',
          }),
        }}
      ></div>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return null
        }

        return (
          <div style={{ position: 'relative' }}>
            {React.cloneElement(child, {
              className: `${child.props.className || ''}`,
              ['data-id']: index,
              ref: (ref) => (blockRef.current[index] = ref),
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Menu
