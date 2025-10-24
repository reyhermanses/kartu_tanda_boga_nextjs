import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Coupon } from '../types'

type Props = {
  coupons: Coupon[]
}

export function CouponCarousel({ coupons }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Group coupons by image
  const groupedCoupons = coupons.reduce((acc, coupon) => {
    const existingGroup = acc.find(group => group.image === coupon.image)
    if (existingGroup) {
      existingGroup.names.push(coupon.name)
    } else {
      acc.push({
        image: coupon.image,
        names: [coupon.name]
      })
    }
    return acc
  }, [] as Array<{ image: string; names: string[] }>)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % groupedCoupons.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + groupedCoupons.length) % groupedCoupons.length)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setCurrentX(e.clientX)
    const diff = e.clientX - startX
    setDragOffset(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = currentX - startX
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
    }

    setDragOffset(0)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)
    const diff = e.touches[0].clientX - startX
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = currentX - startX
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
    }

    setDragOffset(0)
  }

  // Prevent default drag behavior
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    if (containerRef.current) {
      containerRef.current.addEventListener('dragstart', handleDragStart)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('dragstart', handleDragStart)
      }
    }
  }, [])

  if (groupedCoupons.length === 0) return null

  const currentGroup = groupedCoupons[currentIndex]

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-neutral-200 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 300ms ease-in-out'
          }}
        >
          {groupedCoupons.map((group, index) => (
            <div key={index} className="w-full flex-shrink-0 select-none">
              <img
                src={group.image}
                alt={`Coupon ${index + 1}`}
                className="w-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows - positioned in the middle of the image area */}
        {groupedCoupons.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-10"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors z-10"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {groupedCoupons.length > 1 && (
        <div className="flex justify-center mt-2 space-x-1">
          {groupedCoupons.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-yellow-600' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      )}

      {/* Coupon names below the carousel */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-neutral-500 text-center mb-2">
          Nikmati Aneka Voucher Penuh Kejutan
        </div>
        <div className="space-y-1">
          {currentGroup.names.map((name, index) => (
            <div key={index} className="text-base font-semibold text-gray-900 text-center">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
