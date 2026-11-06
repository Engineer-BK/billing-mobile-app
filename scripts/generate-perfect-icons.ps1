Add-Type -AssemblyName System.Drawing

# 1. Load the transparent emblem
$srcPath = (Get-Item 'assets/counter-press-without-orange-background.png').FullName
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Bounding box is (80, 74) to (428, 418), size is 348 x 344
$cropRect = [System.Drawing.Rectangle]::new(80, 74, 348, 344)

# Target size: 520px max dimension ensures it fits 100% within the 66dp keyline circle!
$targetW = 520
$targetH = [int](520 * (344 / 348))
$destX = [int]((1024 - $targetW) / 2)
$destY = [int]((1024 - $targetH) / 2)
$destRect = [System.Drawing.Rectangle]::new($destX, $destY, $targetW, $targetH)

# 1. Create 1024x1024 transparent adaptive foreground
$fgBmp = [System.Drawing.Bitmap]::new(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($fgBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$g.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$fgPath = (Resolve-Path 'assets').Path + '\counter-press-adaptive-foreground.png'
$fgBmp.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$fgBmp.Dispose()
Write-Host "Created: $fgPath ($targetW x $targetH inside 1024x1024)"

# 2. Create 1024x1024 full app icon with brand orange background
$iconBmp = [System.Drawing.Bitmap]::new(1024, 1024, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($iconBmp)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g2.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Background orange color from the brand: #FE8E46 (R=254, G=142, B=70)
$orangeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 254, 142, 70))
$g2.FillRectangle($orangeBrush, 0, 0, 1024, 1024)
$orangeBrush.Dispose()

# Draw the emblem in the exact same safe zone
$g2.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()

$iconPath = (Resolve-Path 'assets').Path + '\counter-press-app-icon.png'
$iconBmp.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Host "Created: $iconPath ($targetW x $targetH on #FE8E46 background)"

$src.Dispose()
