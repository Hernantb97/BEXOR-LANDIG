"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface GeometricBackgroundProps {
  variant?: "primary" | "light" | "secondary"
  density?: "low" | "medium" | "high"
  className?: string
}

export default function GeometricBackground({
  variant = "primary",
  density = "medium",
  className = "",
}: GeometricBackgroundProps) {
  const [shapes, setShapes] = useState<React.ReactNode[]>([])

  useEffect(() => {
    const generateShapes = () => {
      const newShapes: React.ReactNode[] = []
      const shapeCount = density === "low" ? 9 : density === "medium" ? 15 : 24

      // Color variants
      const colorClasses = {
        primary: ["bg-primary/10", "bg-primary/15", "bg-primary/20"],
        light: ["bg-white/10", "bg-white/15", "bg-white/20"],
        secondary: ["bg-secondary/10", "bg-secondary/15", "bg-secondary/20"],
      }

      const colors = colorClasses[variant]

      for (let i = 0; i < shapeCount; i++) {
        // Determine if this shape is a square or rectangle
        const isSquare = Math.random() > 0.4

        // Size (relative to viewport)
        const size = Math.random() * 8 + 2 // 2-10vw
        const width = isSquare ? size : size * (Math.random() * 1.5 + 0.5)
        const height = isSquare ? size : size * (Math.random() * 1.5 + 0.5)

        // Position (percentage of container)
        const left = Math.random() * 90 + 5 // 5-95%
        const top = Math.random() * 90 + 5 // 5-95%

        // Rotation
        const rotate = Math.floor(Math.random() * 45) * (Math.random() > 0.5 ? 1 : -1)

        // Opacity and color
        const color = colors[Math.floor(Math.random() * colors.length)]

        // Create shape with staggered pattern
        const isStaggered = Math.random() > 0.8

        if (isStaggered && i % 3 === 0) {
          // Create a staggered pattern (like in the reference image)
          const staggerSize = size * 0.8
          const staggerCount = Math.floor(Math.random() * 3) + 2 // 2-4 shapes
          const staggerDirection = Math.random() > 0.5 ? "horizontal" : "vertical"

          for (let j = 0; j < staggerCount; j++) {
            const staggerOffset = j * staggerSize
            const staggerLeft = staggerDirection === "horizontal" ? left + staggerOffset : left
            const staggerTop = staggerDirection === "vertical" ? top + staggerOffset : top

            newShapes.push(
              <div
                key={`stagger-${i}-${j}`}
                className={`absolute ${color} rounded-sm`}
                style={{
                  width: `${staggerSize}vw`,
                  height: `${staggerSize}vw`,
                  left: `${staggerLeft}%`,
                  top: `${staggerTop}%`,
                  transform: `rotate(${rotate}deg)`,
                  opacity: 0.8,
                  transition: "all 0.5s ease-in-out",
                }}
              />,
            )
          }
        } else {
          // Create a single shape
          newShapes.push(
            <div
              key={`shape-${i}`}
              className={`absolute ${color} rounded-sm`}
              style={{
                width: `${width}vw`,
                height: `${height}vw`,
                left: `${left}%`,
                top: `${top}%`,
                transform: `rotate(${rotate}deg)`,
                opacity: 0.8,
                transition: "all 0.5s ease-in-out",
              }}
            />,
          )
        }
      }

      // Create X-pattern shapes (inspired by the reference image)
      const createXPattern = (patternId: number) => {
        const xSize = 30 // Size of the X pattern
        const xLeft = Math.random() * 60 + 10 // 10-70%
        const xTop = Math.random() * 60 + 10 // 10-70%
        const color = colors[Math.floor(Math.random() * colors.length)]

        // Create the X pattern with rectangles and squares
        const xShapes = []

        // Top left to bottom right diagonal
        for (let i = 0; i < 5; i++) {
          const offset = i * (xSize / 4)
          xShapes.push(
            <div
              key={`x-tl-br-${patternId}-${i}`}
              className={`absolute ${color} rounded-sm`}
              style={{
                width: i % 2 === 0 ? `${xSize / 8}vw` : `${xSize / 12}vw`,
                height: i % 2 === 0 ? `${xSize / 8}vw` : `${xSize / 12}vw`,
                left: `${xLeft + offset}%`,
                top: `${xTop + offset}%`,
                opacity: 0.9,
              }}
            />,
          )
        }

        // Top right to bottom left diagonal
        for (let i = 0; i < 5; i++) {
          const offset = i * (xSize / 4)
          xShapes.push(
            <div
              key={`x-tr-bl-${patternId}-${i}`}
              className={`absolute ${color} rounded-sm`}
              style={{
                width: i % 2 === 0 ? `${xSize / 8}vw` : `${xSize / 12}vw`,
                height: i % 2 === 0 ? `${xSize / 8}vw` : `${xSize / 12}vw`,
                left: `${xLeft + xSize - offset}%`,
                top: `${xTop + offset}%`,
                opacity: 0.9,
              }}
            />,
          )
        }

        return xShapes
      }

      // Add 1-3 X patterns
      const xPatternCount = Math.floor(Math.random() * 2) + 1
      for (let i = 0; i < xPatternCount; i++) {
        newShapes.push(...createXPattern(i))
      }

      setShapes(newShapes)
    }

    generateShapes()

    // Regenerate shapes on window resize
    const handleResize = () => {
      generateShapes()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [variant, density])

  return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>{shapes}</div>
}
