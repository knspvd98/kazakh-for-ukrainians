import AppKit
import Foundation

let arguments = CommandLine.arguments

guard arguments.count == 7,
      let originX = Double(arguments[3]),
      let originY = Double(arguments[4]),
      let cropWidth = Double(arguments[5]),
      let cropHeight = Double(arguments[6]),
      let sourceImage = NSImage(contentsOfFile: arguments[1]) else {
  fputs("Usage: crop-image.swift INPUT OUTPUT X Y WIDTH HEIGHT\n", stderr)
  exit(1)
}

guard let sourceTiff = sourceImage.tiffRepresentation,
      let sourceBitmap = NSBitmapImageRep(data: sourceTiff) else {
  fputs("Could not read source pixels\n", stderr)
  exit(1)
}

// The image generator writes Retina PNGs. NSImage reports sizes in points, while
// crop coordinates are supplied in pixels, so convert before drawing.
let pointScaleX = sourceImage.size.width / Double(sourceBitmap.pixelsWide)
let pointScaleY = sourceImage.size.height / Double(sourceBitmap.pixelsHigh)
let sourceRect = NSRect(
  x: originX * pointScaleX,
  y: sourceImage.size.height - (originY + cropHeight) * pointScaleY,
  width: cropWidth * pointScaleX,
  height: cropHeight * pointScaleY
)

guard let outputBitmap = NSBitmapImageRep(
  bitmapDataPlanes: nil,
  pixelsWide: Int(cropWidth),
  pixelsHigh: Int(cropHeight),
  bitsPerSample: 8,
  samplesPerPixel: 4,
  hasAlpha: true,
  isPlanar: false,
  colorSpaceName: .deviceRGB,
  bytesPerRow: 0,
  bitsPerPixel: 0
), let context = NSGraphicsContext(bitmapImageRep: outputBitmap) else {
  fputs("Could not create output bitmap\n", stderr)
  exit(1)
}

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
context.imageInterpolation = .high
sourceImage.draw(
  in: NSRect(x: 0, y: 0, width: cropWidth, height: cropHeight),
  from: sourceRect,
  operation: .copy,
  fraction: 1,
  respectFlipped: false,
  hints: nil
)
NSGraphicsContext.restoreGraphicsState()

guard let png = outputBitmap.representation(using: .png, properties: [:]) else {
  fputs("Could not encode PNG\n", stderr)
  exit(1)
}

try png.write(to: URL(fileURLWithPath: arguments[2]))
