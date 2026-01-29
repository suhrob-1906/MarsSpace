import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AttendancePage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: boolean }
    const [coinInputs, setCoinInputs] = useState({}); // { studentId: amount }
    const [loading, setLoading] = useState(true);
    const [canMark, setCanMark] = useState(false);

    useEffect(() => {
        fetchGroupAndStudents();
    }, [groupId]);

    useEffect(() => {
        if (groupId && selectedDate) {
            fetchAttendance();
        }
    }, [groupId, selectedDate]);

    const fetchGroupAndStudents = async () => {
        try {
            const res = await api.get(`/study_groups/${groupId}/`);
            setGroup(res.data);
            setStudents(res.data.students || []);
            checkCanMark(res.data);
        } catch (error) {
            console.error("Failed to fetch group", error);
            toast.error("Failed to load group data");
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const res = await api.get(`/attendance/`, {
                params: { group_id: groupId, date: selectedDate }
            });

            const map = {};
            res.data.forEach(record => {
                map[record.student] = record.is_present;
            });
            setAttendanceMap(map);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        }
    };

    const checkCanMark = () => {
        const today = new Date().toISOString().split('T')[0];
        const isToday = selectedDate === today;
        setCanMark(isToday);
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        const today = new Date().toISOString().split('T')[0];
        setCanMark(date === today);
    };

    const toggleAttendance = async (studentId, currentStatus) => {
        if (!canMark) {
            toast.error("You can only mark attendance for today during class hours");
            return;
        }

        const newStatus = !currentStatus;
        setAttendanceMap(prev => ({ ...prev, [studentId]: newStatus }));

        try {
            await api.post('/attendance/mark_attendance/', {
                group_id: groupId,
                student_id: studentId,
                is_present: newStatus
            });
            toast.success(`Attendance ${newStatus ? 'marked' : 'unmarked'}`);
        } catch (error) {
            setAttendanceMap(prev => ({ ...prev, [studentId]: currentStatus }));
            toast.error(error.response?.data?.error || "Failed to mark attendance");
        }
    };

    const handleCoinInputChange = (studentId, value) => {
        setCoinInputs(prev => ({ ...prev, [studentId]: value }));
    };

    const handleAwardCoins = async (studentId) => {
        const amount = parseInt(coinInputs[studentId] || 0);

        if (!amount || amount <= 0) {
            toast.error("Please enter a valid coin amount");
            return;
        }

        try {
            const res = await api.post('/teacher/award-coins/', {
                student_id: studentId,
                amount: amount,
                group_id: groupId
            });

            toast.success(res.data.message || `Successfully awarded ${amount} coins!`);
            setCoinInputs(prev => ({ ...prev, [studentId]: '' }));
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to award coins");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!group) return <div className="p-8 text-center text-red-500">Group not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <button onClick={() => navigate('/teacher/groups')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft size={20} /> Back to Groups
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-1">{group.name}</h1>
                        <p className="text-slate-500">{group.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                                {group.days_of_week?.join(', ')}
                            </span>
                            <span>•</span>
                            <span>{group.start_time} - {group.end_time}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {!canMark && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-center gap-2 mb-6">
                        <AlertCircle size={16} />
                        Attendance marking is restricted to class days and times.
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-slate-500 text-sm border-b border-slate-200 font-medium">
                            <tr>
                                <th className="pb-3 pl-2">Student</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Mark</th>
                                <th className="pb-3 text-right pr-2">Award Coins</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map(student => {
                                const isPresent = attendanceMap[student.id];
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 pl-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {student.avatar_url ? (
                                                        <img src={student.avatar_url} alt={student.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        student.username[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{student.first_name} {student.last_name}</div>
                                                    <div className="text-xs text-slate-500">@{student.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {isPresent ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle size={14} /> Present
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    <XCircle size={14} /> Absent
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => toggleAttendance(student.id, isPresent)}
                                                disabled={!canMark}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPresent
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                                    } ${!canMark ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isPresent ? 'Mark Absent' : 'Mark Present'}
                                            </button>
                                        </td>
                                        <td className="py-3 text-right pr-2">
                                            <div className="flex items-center justify-end gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Amount"
                                                    value={coinInputs[student.id] || ''}
                                                    onChange={(e) => handleCoinInputChange(student.id, e.target.value)}
                                                    className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                />
                                                <button
                                                    onClick={() => handleAwardCoins(student.id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center gap-1.5"
                                                >
                                                    <Coins size={14} />
                                                    Give
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
