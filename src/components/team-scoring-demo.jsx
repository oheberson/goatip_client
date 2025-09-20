"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeTeamScoringLikelihood, getTeamDetailedAnalysis } from "@/lib/team-scoring-analysis";
import { mapTeamName } from "@/lib/constants";

/**
 * Demo component showing how to use the team scoring analysis
 * This is for demonstration purposes and can be integrated into your main app
 */
export function TeamScoringDemo({ detailedMatchesData, playersData }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);

  // Get unique teams from players data
  const getUniqueTeams = () => {
    if (!playersData?.players) return [];
    const teams = [...new Set(playersData.players.map(p => p.teamName))];
    return teams.map(mapTeamName);
  };

  const runAnalysis = async () => {
    if (!detailedMatchesData || detailedMatchesData.length === 0) {
      alert("No detailed matches data available");
      return;
    }

    setLoading(true);
    try {
      const uniqueTeams = getUniqueTeams();
      console.log("Unique teams:", uniqueTeams);
      
      const result = analyzeTeamScoringLikelihood(detailedMatchesData, uniqueTeams);
      console.log("Analysis result:", result);
      
      setAnalysis(result);
    } catch (error) {
      console.error("Error running analysis:", error);
      alert("Error running analysis. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const getTeamDetails = (teamName) => {
    if (!detailedMatchesData || !teamName) return;
    
    const uniqueTeams = getUniqueTeams();
    const details = getTeamDetailedAnalysis(detailedMatchesData, teamName, uniqueTeams);
    setTeamDetails(details);
    setSelectedTeam(teamName);
  };

  // Auto-run analysis when data is available
  useEffect(() => {
    if (detailedMatchesData && playersData && !analysis) {
      runAnalysis();
    }
  }, [detailedMatchesData, playersData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Scoring Analysis Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={runAnalysis} 
              disabled={loading || !detailedMatchesData}
              className="w-full"
            >
              {loading ? "Analyzing..." : "Run Team Scoring Analysis"}
            </Button>
            
            {!detailedMatchesData && (
              <p className="text-sm text-muted-foreground">
                No detailed matches data available. Make sure the data is loaded.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && analysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Teams Most Likely to Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.slice(0, 10).map((team, index) => (
                <div
                  key={team.team}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    index === 0
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : index === 1
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                      : index === 2
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                      : "border-gray-200 hover:border-primary"
                  }`}
                  onClick={() => getTeamDetails(team.team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{team.team}</h4>
                        <p className="text-sm text-muted-foreground">
                          Best scoring moment: {team.moment_for_scoring}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {team.likely_goals}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        expected goals
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Click on any team to see detailed analysis</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Detailed Analysis: {selectedTeam}</CardTitle>
          </CardHeader>
          <CardContent>
            {teamDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Total Matches</h4>
                    <p className="text-2xl font-bold text-primary">
                      {teamDetails.total_matches}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Analysis Status</h4>
                    <p className="text-sm text-muted-foreground">
                      {teamDetails.overall_performance ? "Complete" : "Processing..."}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>This is a simplified demo. The full analysis would include:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Detailed performance metrics</li>
                    <li>Timing pattern analysis</li>
                    <li>Opponent weakness analysis</li>
                    <li>Consistency scores</li>
                    <li>Historical trends</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading detailed analysis...</p>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setSelectedTeam(null)}
              className="mt-4"
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>📈 Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold">Teams Analyzed</h4>
                <p className="text-2xl font-bold text-primary">
                  {analysis.length}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Top Scorer</h4>
                <p className="font-semibold">
                  {analysis[0]?.team} ({analysis[0]?.likely_goals} goals)
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Moment Distribution</h4>
              <div className="space-y-2">
                {["1T", "2T", "No specific moment"].map((moment) => {
                  const count = analysis.filter(t => t.moment_for_scoring === moment).length;
                  const percentage = (count / analysis.length) * 100;
                  return (
                    <div key={moment} className="flex items-center justify-between">
                      <span>{moment}</span>
                      <span className="font-semibold">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
