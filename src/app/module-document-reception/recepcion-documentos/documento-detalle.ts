import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { DocumentsService, ElectronicDocument } from './services/documents.service'

@Component({
  selector: 'app-documento-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documento-detalle.html',
  styleUrl: './documento-detalle.css'
})
export class DocumentoDetalle implements OnInit {
  doc: ElectronicDocument | null = null
  loading = false
  error = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: DocumentsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    if (!id) {
      this.router.navigate(['/recepción-documentos'])
      return
    }
    this.loading = true
    this.service.getDocumentDetails(id).subscribe({
      next: (d) => { this.doc = d; this.loading = false },
      error: (err) => { this.error = err?.status === 403 ? 'Acceso restringido' : 'No se pudo cargar'; this.loading = false }
    })
  }

  downloadXml(): void {
    const content = this.doc?.xml_document || ''
    if (!content) return
    const blob = new Blob([content], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documento-${this.doc?.id}-${this.doc?.cufe || 'xml'}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  back(): void {
    this.router.navigate(['/recepción-documentos'])
  }

  copyToClipboard(text: string): void {
    if (!text) return
    navigator.clipboard?.writeText(text)
  }

  envBadge(env: string): string {
    if (env === 'Pruebas') return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  statusBadge(st: string): string {
    const s = (st || '').toLowerCase()
    if (s.includes('válid') || s.includes('valid')) return 'bg-green-100 text-green-800'
    if (s.includes('rechaz')) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  modeBadge(m: string): string {
    return m === 'en contingencia' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
  }
}