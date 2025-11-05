import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../utils/supabaseClients';
import { LocationFilter, buildLocationQuery } from './reportServices';

export interface EarlyWarningCase {
    profileid: number;
    name: string;
    age: number;
    location: string;
    repeatedPregnancy: boolean;
    pregnancyCount: number;
    schoolDropout: boolean;
    dropoutDate: string;
    riskLevel: 'high' | 'medium';
}

export interface WarningStats {
    totalHighRisk: number;
    totalRepeatedPregnancy: number;
    totalDropouts: number;
}

export const fetchEarlyWarnings = async (locationFilter: LocationFilter): Promise<{ warnings: EarlyWarningCase[], stats: WarningStats }> => {
    let profileQuery = supabase.from('profile').select('*');
    profileQuery = buildLocationQuery(profileQuery, locationFilter);
    const { data: profiles } = await profileQuery;

    if (!profiles) {
        return {
            warnings: [],
            stats: {
                totalHighRisk: 0,
                totalRepeatedPregnancy: 0,
                totalDropouts: 0,
            }
        };
    }

    const warnings: EarlyWarningCase[] = [];
    
    for (const profile of profiles) {
        let repeatedPregnancy = false;
        let pregnancyCount = 0;
        let schoolDropout = false;
        let dropoutDate = '';

        // Check pregnancy count
        const { data: healthRecords } = await supabase
            .from('maternalhealthRecord')
            .select('num_of_pregnancies')
            .eq('profileid', profile.profileid)
            .order('health_id', { ascending: false })
            .limit(1);

        if (healthRecords && healthRecords.length > 0) {
            pregnancyCount = healthRecords[0].num_of_pregnancies || 0;
            repeatedPregnancy = pregnancyCount >= 2;
        }

        // Check dropout status
        const { data: eduRecords } = await supabase
            .from('EducationAndTraining')
            .select('status, enroll_dropout_Date')
            .eq('profileid', profile.profileid)
            .eq('status', 'Dropout')
            .order('educationid', { ascending: false })
            .limit(1);

        if (eduRecords && eduRecords.length > 0) {
            schoolDropout = true;
            dropoutDate = eduRecords[0].enroll_dropout_Date || '';
        }

        // Add to warnings if any flag is triggered
        if (repeatedPregnancy || schoolDropout) {
            const riskLevel = (repeatedPregnancy && schoolDropout) ? 'high' : 'medium';
            
            warnings.push({
                profileid: profile.profileid,
                name: `${profile.firstName} ${profile.lastName}`,
                age: profile.age || 0,
                location: `${profile.barangay}, ${profile.municipality}`,
                repeatedPregnancy,
                pregnancyCount,
                schoolDropout,
                dropoutDate,
                riskLevel,
            });
        }
    }

    // Sort by risk level (high first)
    warnings.sort((a, b) => {
        if (a.riskLevel === 'high' && b.riskLevel === 'medium') return -1;
        if (a.riskLevel === 'medium' && b.riskLevel === 'high') return 1;
        return 0;
    });

    const stats: WarningStats = {
        totalHighRisk: warnings.filter(w => w.riskLevel === 'high').length,
        totalRepeatedPregnancy: warnings.filter(w => w.repeatedPregnancy).length,
        totalDropouts: warnings.filter(w => w.schoolDropout).length,
    };

    return { warnings, stats };
};

export const generateEarlyWarningReport = async (
    earlyWarnings: EarlyWarningCase[], 
    warningStats: WarningStats, 
    locationText: string
) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Early Warning Indicators Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Location: ${locationText}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);

    // Summary
    doc.setFontSize(12);
    doc.text('Warning Summary', 14, 50);
    const summaryData = [
        ['High Risk Cases (Both Flags)', warningStats.totalHighRisk.toString()],
        ['Repeated Pregnancy Cases', warningStats.totalRepeatedPregnancy.toString()],
        ['School Dropout Cases', warningStats.totalDropouts.toString()],
        ['Total Cases Flagged', earlyWarnings.length.toString()],
    ];

    autoTable(doc, {
        startY: 55,
        head: [['Category', 'Count']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60] },
    });

    // Detailed list
    doc.setFontSize(12);
    doc.text('Detailed Cases', 14, (doc as any).lastAutoTable.finalY + 15);

    const columns = ['Name', 'Age', 'Location', 'Risk Level', 'Pregnancy Count', 'Dropout'];
    const rows = earlyWarnings.map(w => [
        w.name,
        w.age.toString(),
        w.location,
        w.riskLevel.toUpperCase(),
        w.repeatedPregnancy ? `${w.pregnancyCount}x` : 'N/A',
        w.schoolDropout ? 'Yes' : 'No',
    ]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [columns],
        body: rows,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [231, 76, 60] },
        didParseCell: (data) => {
            // Highlight high risk rows
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'HIGH') {
                    data.cell.styles.fillColor = [255, 200, 200];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    doc.save(`Early_Warning_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};