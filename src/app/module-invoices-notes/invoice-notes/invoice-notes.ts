import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NoteService, CreditDebitNote, CreateNotePayload, NoteType } from '../services/note.service';
import { InvoiceService } from '../services/invoice.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-invoice-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-notes.html',
  styleUrl: './invoice-notes.css'
})
export class InvoiceNotes implements OnInit {
  invoiceId!: number;
  notes: CreditDebitNote[] = [];
  loading = false;
  creating = false;
  note_type: NoteType = 'credit';
  reason = '';
  total_amount: number | null = null;
  status: 'accepted' | 'rejected' | 'pending' | '' = '';
  issue_date: string = '';
  lastMessage: string = '';
  invoiceTotal: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private noteService: NoteService, private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.invoiceId = id;
      const qpType = this.route.snapshot.queryParamMap.get('type');
      if (qpType === 'credit' || qpType === 'debit') {
        this.note_type = qpType as NoteType;
      }
      this.loadInvoiceTotal();
      this.fetchNotes();
    }
  }

  loadInvoiceTotal(): void {
    this.invoiceService.getInvoice(this.invoiceId).subscribe({
      next: inv => {
        this.invoiceTotal = inv?.payable_amount ?? null;
      },
      error: () => {
        this.invoiceTotal = null;
      }
    });
  }

  fetchNotes(): void {
    this.loading = true;
    this.noteService.getByInvoice(this.invoiceId).subscribe({
      next: r => {
        this.notes = r || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createNote(): void {
    if (!this.note_type) return;
    this.creating = true;
    const payload: CreateNotePayload = {
      reason: this.reason,
      note_type: this.note_type,
      total_amount: this.total_amount ?? 0,
      status: this.status || undefined,
      issue_date: this.issue_date || undefined
    };
    this.noteService.create(this.invoiceId, payload).subscribe({
      next: res => {
        this.lastMessage = res.message || '';
        this.creating = false;
        this.note_type = 'credit';
        this.reason = '';
        this.total_amount = null;
        this.status = '';
        this.issue_date = '';
        this.fetchNotes();
      },
      error: () => {
        this.creating = false;
      }
    });
  }

  annulInvoice(): void {
    if (!this.reason) return;
    this.creating = true;
    this.noteService.annul(this.invoiceId, this.reason).subscribe({
      next: res => {
        this.lastMessage = res.message || '';
        this.creating = false;
        this.reason = '';
        this.fetchNotes();
      },
      error: () => {
        this.creating = false;
      }
    });
  }

  downloadPDF(noteId: number): void {
    this.noteService.downloadPDF(noteId).subscribe({
      next: blob => {
        saveAs(blob, `nota_${noteId}.pdf`);
      }
    });
  }

  downloadXML(noteId: number): void {
    this.noteService.downloadXML(noteId).subscribe({
      next: blob => {
        saveAs(blob, `nota_${noteId}.xml`);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/facturacion']);
  }
}