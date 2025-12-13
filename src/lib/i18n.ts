const dict: Record<string, Record<string, string>> = {
  'pt-BR': {
    dash_welcome: 'Bem-vindo',
    courses: 'Cursos',
    modules: 'Módulos',
    exams: 'Provas',
    questions_bank: 'Banco de Questões',
    enrollments: 'Matrículas',
    save: 'Salvar',
    publish: 'Publicar',
    delete: 'Excluir'
  },
  'en-US': {
    dash_welcome: 'Welcome',
    courses: 'Courses',
    modules: 'Modules',
    exams: 'Exams',
    questions_bank: 'Question Bank',
    enrollments: 'Enrollments',
    save: 'Save',
    publish: 'Publish',
    delete: 'Delete'
  },
  'es-ES': {
    dash_welcome: 'Bienvenido',
    courses: 'Cursos',
    modules: 'Módulos',
    exams: 'Exámenes',
    questions_bank: 'Banco de Preguntas',
    enrollments: 'Matrículas',
    save: 'Guardar',
    publish: 'Publicar',
    delete: 'Eliminar'
  }
};

export function t(lang: string, key: string): string {
  const l = dict[lang] || dict['pt-BR'];
  return l[key] || key;
}

