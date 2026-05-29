export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  filename?: string;
}

export class ExportService {
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static toCSV<T extends Record<string, any>>(data: T[], filename: string = 'export.csv'): void {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(','),
      ...data.map(item =>
        keys.map(key => {
          const value = item[key];
          const stringValue = String(value ?? '');
          // Escape quotes and wrap in quotes if contains comma
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      ),
    ].join('\n');

    this.downloadFile(csv, filename, 'text/csv');
  }

  static toJSON<T>(data: T, filename: string = 'export.json'): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, filename, 'application/json');
  }

  static formatTransactionsForExport(transactions: any[]): any[] {
    return transactions.map(t => ({
      'Date': new Date(t.date).toLocaleDateString('fr-FR'),
      'Description': t.description,
      'Catégorie': t.category,
      'Type': t.type,
      'Montant': t.amount,
      'Devise': t.currency || 'USD',
      'Notes': t.notes || '',
    }));
  }

  static formatMissionsForExport(missions: any[]): any[] {
    return missions.map(m => ({
      'Titre': m.title,
      'Catégorie': m.category,
      'Priorité': m.priority,
      'Statut': m.status,
      'Énergie': m.energy_level || '-',
      'Difficulté': m.difficulty || '-',
      'Durée estimée (min)': m.estimated_duration_minutes || '-',
      'Date limite': m.deadline ? new Date(m.deadline).toLocaleDateString('fr-FR') : '-',
      'Notes': m.notes || '',
      'Créé le': new Date(m.created_at).toLocaleDateString('fr-FR'),
    }));
  }

  static formatExercisesForExport(exercises: any[]): any[] {
    return exercises.map(e => ({
      'Nom': e.name,
      'Groupe musculaire': e.muscle_group,
      'Séries': e.sets,
      'Répétitions': e.reps,
      'Poids objectif (kg)': e.weight_goal || '-',
    }));
  }

  static formatSubjectsForExport(subjects: any[]): any[] {
    return subjects.map(s => ({
      'Matière': s.name,
      'Semestre': s.semester,
      'Professeur': s.professor || '-',
      'Statut': s.status,
      'Chapitres terminés': s.chaptersDone,
      'Chapitres totaux': s.chaptersTotal,
      'Crédits (ECTS)': s.ects || '-',
      'Date examen': s.examDate ? new Date(s.examDate).toLocaleDateString('fr-FR') : '-',
      'Niveau stress': s.stressLevel,
      'Notes': s.notes || '',
    }));
  }
}
