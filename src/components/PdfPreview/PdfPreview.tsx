import { useState, useEffect, useCallback, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Box, Typography, CircularProgress, Button, ButtonGroup } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfPreviewProps {
    file: File
}

export default function PdfPreview({ file }: PdfPreviewProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null)
    const [numPages, setNumPages] = useState<number | null>(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [scale, setScale] = useState(1.0)
    const [loadError, setLoadError] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    // Saved scroll ratio (scrollTop / scrollHeight) to restore after zoom re-render
    const savedScrollRatioRef = useRef<number | null>(null)
    // When true, scroll to top after next page render (page navigation)
    const resetScrollRef = useRef(false)
    // When true, auto-fit the page on first canvas render (or when file changes)
    const shouldFitOnLoadRef = useRef(true)

    useEffect(() => {
        const url = URL.createObjectURL(file)
        setObjectUrl(url)
        setNumPages(null)
        setPageNumber(1)
        setScale(1.0)
        setLoadError(false)
        shouldFitOnLoadRef.current = true
        return () => URL.revokeObjectURL(url)
    }, [file])

    const handleLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages)
        setLoadError(false)
    }, [])

    const handleLoadError = useCallback(() => {
        setLoadError(true)
    }, [])

    // Save scroll ratio before any zoom change so we can restore after re-render
    const saveScrollRatio = useCallback(() => {
        const el = scrollRef.current
        if (el && el.scrollHeight > 0) {
            savedScrollRatioRef.current = el.scrollTop / el.scrollHeight
        }
    }, [])

    // ResizeObserver on the canvas fires during the browser layout phase — after pdfjs
    // updates canvas dimensions but before paint. At that point scrollHeight is already
    // correct, so we can reliably restore scrollTop. onRenderSuccess + rAF fires too
    // early (scrollHeight hasn't updated yet), which is why the previous approach failed.
    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const restoreScroll = () => {
            const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
            // Skip while pdfjs is mid-reset (zero-dimension canvas)
            if (!canvas || canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return
            if (resetScrollRef.current) {
                container.scrollTop = 0
                resetScrollRef.current = false
            } else if (savedScrollRatioRef.current !== null) {
                container.scrollTop = savedScrollRatioRef.current * container.scrollHeight
                savedScrollRatioRef.current = null
            } else if (shouldFitOnLoadRef.current) {
                // Auto-fit entire page on first load; set flag false before setScale
                // so the subsequent resize event from the scale change is a no-op.
                shouldFitOnLoadRef.current = false
                setScale(s => Math.min(
                    (container.clientWidth * s) / canvas.offsetWidth,
                    (container.clientHeight * s) / canvas.offsetHeight,
                ))
            }
        }

        let roCanvas: ResizeObserver | null = null

        const attachResizeObserver = () => {
            const canvas = container.querySelector('canvas')
            if (!canvas) return
            roCanvas?.disconnect()
            roCanvas = new ResizeObserver(restoreScroll)
            roCanvas.observe(canvas)
        }

        // Watch for the canvas being added to the DOM (initial load, page navigation)
        const mo = new MutationObserver(attachResizeObserver)
        mo.observe(container, { childList: true, subtree: true })
        attachResizeObserver() // In case the canvas already exists

        return () => {
            mo.disconnect()
            roCanvas?.disconnect()
        }
    }, [])

    const handleZoomIn = useCallback(() => {
        saveScrollRatio()
        setScale(s => Math.min(s + 0.25, 3))
    }, [saveScrollRatio])

    const handleZoomOut = useCallback(() => {
        saveScrollRatio()
        setScale(s => Math.max(s - 0.25, 0.5))
    }, [saveScrollRatio])

    // Fit: scale so the entire page fits within the viewer (min of width and height ratios)
    const handleFit = useCallback(() => {
        const container = scrollRef.current
        if (!container) return
        const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
        if (!canvas || canvas.offsetWidth === 0 || canvas.offsetHeight === 0) return
        setScale(s => Math.min(
            (container.clientWidth * s) / canvas.offsetWidth,
            (container.clientHeight * s) / canvas.offsetHeight,
        ))
    }, [])

    const handlePrevPage = useCallback(() => {
        resetScrollRef.current = true
        setPageNumber(p => Math.max(1, p - 1))
    }, [])

    const handleNextPage = useCallback(() => {
        resetScrollRef.current = true
        setPageNumber(p => Math.min(numPages ?? 1, p + 1))
    }, [numPages])

    if (!objectUrl) return null

    return (
        <Box>
            {/* Toolbar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 1,
                    px: 1,
                }}
            >
                {/* Paging */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1}
                    >
                        ‹ Prev
                    </Button>
                    <Typography variant="body2">
                        Page {pageNumber} of {numPages ?? '—'}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleNextPage}
                        disabled={pageNumber >= (numPages ?? 1)}
                    >
                        Next ›
                    </Button>
                </Box>

                {/* Zoom */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ButtonGroup size="small" variant="outlined">
                        <Button
                            onClick={handleZoomIn}
                            disabled={scale >= 3}
                            startIcon={<ZoomInIcon />}
                        >
                            In
                        </Button>
                        <Button
                            onClick={handleZoomOut}
                            disabled={scale <= 0.5}
                            startIcon={<ZoomOutIcon />}
                        >
                            Out
                        </Button>
                        <Button onClick={handleFit} startIcon={<ZoomOutMapIcon />}>
                            Fit
                        </Button>
                    </ButtonGroup>
                    <Typography variant="body2" color="text.secondary">
                        {Math.round(scale * 100)}%
                    </Typography>
                </Box>
            </Box>

            {/* PDF canvas */}
            <Box
                ref={scrollRef}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: 'grey.900',
                    height: 560,
                }}
            >
                {loadError ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="error">
                            Unable to preview this PDF. The file may be corrupted.
                        </Typography>
                    </Box>
                ) : (
                    <Document
                        file={objectUrl}
                        onLoadSuccess={handleLoadSuccess}
                        onLoadError={handleLoadError}
                        loading={
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={28} />
                            </Box>
                        }
                        options={{
                            cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                            cMapPacked: true,
                        }}
                    >
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={scale}
                        />
                    </Document>
                )}
            </Box>
        </Box>
    )
}
