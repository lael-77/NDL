/**
 * Report Generator Utilities
 * Generates PDF and CSV reports for match results
 */

export interface MatchReportData {
  match: {
    id: string;
    homeTeam: { name: string; school?: { name: string } };
    awayTeam: { name: string; school?: { name: string } };
    scheduledAt: string;
    status: string;
    arena?: { name: string };
  };
  teamScores: {
    [teamId: string]: {
      autoScore?: {
        functionality: number;
        innovation: number;
        plagiarismFlag: boolean;
        aiGeneratedFlag: boolean;
      };
      judgeScores: Array<{
        judge: { fullName: string };
        codeFunctionality: number;
        innovation: number;
        presentation: number;
        problemRelevance: number;
        feasibility: number;
        collaboration: number;
        comments?: string;
      }>;
      averageScore: number;
    };
  };
  playerScores: Array<{
    player: { fullName: string; studentRole?: string };
    team: { name: string };
    scores: {
      rolePerformance: number;
      initiative: number;
      technicalMastery: number;
      creativity: number;
      collaboration: number;
    };
    averageScore: number;
    notes?: string;
  }>;
  feedback: Array<{
    judge: { fullName: string };
    message: string;
    isPublic: boolean;
    createdAt: string;
  }>;
}

/**
 * Generate CSV report
 */
export const generateCSVReport = (data: MatchReportData): string => {
  const lines: string[] = [];

  // Header
  lines.push('NDL Match Report');
  lines.push(`Match: ${data.match.homeTeam.name} vs ${data.match.awayTeam.name}`);
  lines.push(`Date: ${new Date(data.match.scheduledAt).toLocaleString()}`);
  lines.push(`Status: ${data.match.status}`);
  lines.push('');

  // Team Scores
  lines.push('TEAM SCORES');
  lines.push('Team,Functionality,Innovation,Presentation,Problem Relevance,Feasibility,Collaboration,Average Score');
  
  Object.entries(data.teamScores).forEach(([teamId, scores]) => {
    const teamName = teamId === data.match.homeTeam.id 
      ? data.match.homeTeam.name 
      : data.match.awayTeam.name;
    
    const avgScore = scores.averageScore || 0;
    const judgeScore = scores.judgeScores[0] || {};
    
    lines.push([
      teamName,
      judgeScore.codeFunctionality || 0,
      judgeScore.innovation || 0,
      judgeScore.presentation || 0,
      judgeScore.problemRelevance || 0,
      judgeScore.feasibility || 0,
      judgeScore.collaboration || 0,
      avgScore.toFixed(2),
    ].join(','));
  });

  lines.push('');

  // Player Scores
  lines.push('PLAYER SCORES');
  lines.push('Player,Team,Role,Role Performance,Initiative,Technical Mastery,Creativity,Collaboration,Average Score');
  
  data.playerScores.forEach(player => {
    lines.push([
      player.player.fullName,
      player.team.name,
      player.player.studentRole || 'N/A',
      player.scores.rolePerformance,
      player.scores.initiative,
      player.scores.technicalMastery,
      player.scores.creativity,
      player.scores.collaboration,
      player.averageScore.toFixed(2),
    ].join(','));
  });

  lines.push('');

  // Feedback
  if (data.feedback.length > 0) {
    lines.push('FEEDBACK');
    lines.push('Judge,Message,Public,Created At');
    data.feedback.forEach(fb => {
      lines.push([
        fb.judge.fullName,
        `"${fb.message.replace(/"/g, '""')}"`,
        fb.isPublic ? 'Yes' : 'No',
        new Date(fb.createdAt).toLocaleString(),
      ].join(','));
    });
  }

  return lines.join('\n');
};

/**
 * Download CSV report
 */
export const downloadCSVReport = (data: MatchReportData, filename?: string) => {
  const csv = generateCSVReport(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `match-report-${data.match.id}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate PDF report (using jsPDF)
 * Note: Requires jsPDF library - install with: npm install jspdf
 */
export const generatePDFReport = async (data: MatchReportData): Promise<Blob> => {
  // Dynamic import to avoid bundle size issues if jsPDF not installed
  try {
    // Check if jspdf is available
    let jsPDF;
    try {
      const jspdfModule = await import('jspdf');
      jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;
      if (!jsPDF) {
        throw new Error('jsPDF class not found in module');
      }
    } catch (importError) {
      console.error('Failed to import jspdf:', importError);
      throw new Error('PDF generation requires jsPDF library. Install with: npm install jspdf');
    }
    const doc = new jsPDF();

    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text('NDL Match Report', 105, yPos, { align: 'center' });
    yPos += 15;

    // Match Info
    doc.setFontSize(12);
    doc.text(`${data.match.homeTeam.name} vs ${data.match.awayTeam.name}`, 105, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(data.match.scheduledAt).toLocaleString()}`, 105, yPos, { align: 'center' });
    yPos += 8;
    doc.text(`Status: ${data.match.status}`, 105, yPos, { align: 'center' });
    yPos += 15;

    // Team Scores Section
    doc.setFontSize(14);
    doc.text('Team Scores', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    Object.entries(data.teamScores).forEach(([teamId, scores]) => {
      const teamName = teamId === data.match.homeTeam.id 
        ? data.match.homeTeam.name 
        : data.match.awayTeam.name;
      
      doc.setFontSize(12);
      doc.text(teamName, 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      const judgeScore = scores.judgeScores[0] || {};
      doc.text(`Functionality: ${judgeScore.codeFunctionality || 0}/10`, 20, yPos);
      yPos += 6;
      doc.text(`Innovation: ${judgeScore.innovation || 0}/10`, 20, yPos);
      yPos += 6;
      doc.text(`Presentation: ${judgeScore.presentation || 0}/10`, 20, yPos);
      yPos += 6;
      doc.text(`Problem Relevance: ${judgeScore.problemRelevance || 0}/10`, 20, yPos);
      yPos += 6;
      doc.text(`Feasibility: ${judgeScore.feasibility || 0}/10`, 20, yPos);
      yPos += 6;
      doc.text(`Collaboration: ${judgeScore.collaboration || 0}/10`, 20, yPos);
      yPos += 6;
      doc.text(`Average Score: ${(scores.averageScore || 0).toFixed(2)}/10`, 20, yPos);
      yPos += 10;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Player Scores Section
    if (data.playerScores.length > 0) {
      doc.setFontSize(14);
      doc.text('Player Scores', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      data.playerScores.forEach(player => {
        doc.text(`${player.player.fullName} (${player.team.name})`, 14, yPos);
        yPos += 6;
        doc.text(`Average: ${player.averageScore.toFixed(2)}/10`, 20, yPos);
        yPos += 8;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    return doc.output('blob');
  } catch (error) {
    console.error('PDF generation error (jsPDF may not be installed):', error);
    throw new Error('PDF generation requires jsPDF library. Install with: npm install jspdf');
  }
};

/**
 * Download PDF report
 */
export const downloadPDFReport = async (data: MatchReportData, filename?: string) => {
  try {
    const blob = await generatePDFReport(data);
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `match-report-${data.match.id}.pdf`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('Failed to generate PDF. CSV export is available as an alternative.');
  }
};

