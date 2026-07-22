// Placeholder — the React Flow canvas editor lands in Phase 4 (Canvas).
export default function WorkflowEditorPage({ params }: { params: { id: string } }) {
  return (
    <main className="p-8">
      <p className="text-muted-foreground">
        Canvas editor for workflow {params.id} — built in Phase 4.
      </p>
    </main>
  );
}
