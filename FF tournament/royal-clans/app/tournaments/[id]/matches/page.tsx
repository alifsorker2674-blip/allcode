import MatchesClient from "@/components/MatchesClient";

export default async function TournamentMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchesClient tournamentId={id} />;
}
