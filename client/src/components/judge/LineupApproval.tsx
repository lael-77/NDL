import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { format } from "date-fns";

interface LineupApprovalProps {
  match: any;
  lineups: any[];
  onApprove: (teamId: string) => void;
  onReject: (teamId: string) => void;
}

export const LineupApproval = ({
  match,
  lineups,
  onApprove,
  onReject,
}: LineupApprovalProps) => {
  if (!match) return null;

  const homeTeamLineups = lineups.filter((l) => l.teamId === match.homeTeamId);
  const awayTeamLineups = lineups.filter((l) => l.teamId === match.awayTeamId);

  const getTeamLineupStatus = (teamId: string) => {
    const teamLineups = lineups.filter((l) => l.teamId === teamId);
    if (teamLineups.length === 0) return "pending";
    const statuses = teamLineups.map((l) => l.status);
    if (statuses.every((s) => s === "approved")) return "approved";
    if (statuses.some((s) => s === "submitted")) return "submitted";
    return "pending";
  };

  const renderTeamLineup = (team: any, teamLineups: any[]) => {
    const status = getTeamLineupStatus(team.id);

    return (
      <Card key={team.id} className="bg-white border-[#E0E0E0]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <Users className="h-5 w-5" />
                {team.name}
              </CardTitle>
              <CardDescription className="text-[#4A4A4A]">
                {team.school?.name}
              </CardDescription>
            </div>
            <Badge
              variant={
                status === "approved"
                  ? "default"
                  : status === "submitted"
                  ? "outline"
                  : "secondary"
              }
              className={
                status === "approved"
                  ? "bg-[#22C55E]"
                  : status === "submitted"
                  ? "border-[#FACC15] text-[#FACC15]"
                  : ""
              }
            >
              {status === "approved" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : status === "submitted" ? (
                <Clock className="h-3 w-3 mr-1" />
              ) : null}
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {teamLineups.length === 0 ? (
            <div className="text-center py-8 text-[#4A4A4A] text-sm">
              No lineup submitted yet
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#1A1A1A]">Player</TableHead>
                    <TableHead className="text-[#1A1A1A]">Role</TableHead>
                    <TableHead className="text-[#1A1A1A]">Position</TableHead>
                    <TableHead className="text-[#1A1A1A]">Captain</TableHead>
                    <TableHead className="text-[#1A1A1A]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamLineups.map((lineup) => (
                    <TableRow key={lineup.id}>
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {lineup.player?.fullName}
                      </TableCell>
                      <TableCell className="text-[#4A4A4A]">
                        {lineup.role}
                      </TableCell>
                      <TableCell className="text-[#4A4A4A]">
                        {lineup.position || "N/A"}
                      </TableCell>
                      <TableCell>
                        {lineup.isCaptain ? (
                          <Badge variant="outline" className="border-[#0077CC] text-[#0077CC]">
                            Captain
                          </Badge>
                        ) : (
                          <span className="text-[#4A4A4A]">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lineup.status === "approved"
                              ? "default"
                              : lineup.status === "submitted"
                              ? "outline"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {lineup.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {status === "submitted" && (
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={() => onApprove(team.id)}
                    size="sm"
                    className="bg-[#22C55E] hover:bg-[#16A34A]"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Lineup
                  </Button>
                  <Button
                    onClick={() => onReject(team.id)}
                    size="sm"
                    variant="outline"
                    className="border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48]/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Pre-Match Lineups</h3>
        <p className="text-sm text-[#4A4A4A] mb-6">
          Review and approve team lineups before the match starts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTeamLineup(match.homeTeam, homeTeamLineups)}
        {renderTeamLineup(match.awayTeam, awayTeamLineups)}
      </div>
    </div>
  );
};

