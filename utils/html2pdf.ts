import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export async function generatePdfFromHtml(htmlContent: string): Promise<Blob> {
  // Create a temporary div to hold the HTML content
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = htmlContent
  document.body.appendChild(tempDiv)

  try {
    // Convert the HTML element to a canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 1,
      useCORS: true,
      logging: false,
    })

    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Get dimensions
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png")
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

    // Return the PDF as blob
    return pdf.output("blob")
  } finally {
    // Clean up the temporary div
    document.body.removeChild(tempDiv)
  }
}
