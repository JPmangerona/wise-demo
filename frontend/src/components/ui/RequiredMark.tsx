/**
 * Asterisco vermelho exibido ao lado do label de campos obrigatórios.
 * Use dentro do <label>: <label>Título <RequiredMark /></label>
 */
export function RequiredMark() {
  return (
    <>
      <span className="text-red-500 ml-0.5 select-none" aria-hidden="true">*</span>
      <span className="sr-only"> (obrigatório)</span>
    </>
  );
}
