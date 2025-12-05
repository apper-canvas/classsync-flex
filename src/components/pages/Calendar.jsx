import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth, 
  addMonths, 
  subMonths,
  parseISO,
  isToday,
  startOfDay
} from "date-fns";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import assignmentService from "@/services/api/assignmentService";
import calendarService from "@/services/api/calendarService";
import classService from "@/services/api/classService";
import userService from "@/services/api/userService";
import { toast } from "react-toastify";

const Calendar = () => {
  const { currentRole } = useOutletContext();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [exams, setExams] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("month");

  const loadCalendarData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const [
        assignmentsData,
        eventsData,
        examsData,
        schedulesData,
        classesData
      ] = await Promise.all([
        assignmentService.getAssignmentsByDateRange(monthStart, monthEnd),
        calendarService.getEventsByDateRange(monthStart, monthEnd),
        calendarService.getExamsByDateRange(monthStart, monthEnd),
        classService.getClassSchedules(),
        classService.getAll()
      ]);
      
      setAssignments(assignmentsData);
      setEvents(eventsData);
      setExams(examsData);
      setSchedules(schedulesData);
      setClasses(classesData);
    } catch (err) {
      console.error("Error loading calendar data:", err);
      setError("Failed to load calendar data");
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const getClassColor = (subject) => {
    const colors = {
      "Mathematics": "#3B82F6",
      "Science": "#10B981", 
      "History": "#8B5CF6",
      "English": "#F59E0B",
      "Art": "#EF4444",
      "Physical Education": "#06B6D4"
    };
    return colors[subject] || "#6B7280";
  };

  const getEventsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = [];

    // Add assignments
    assignments.forEach(assignment => {
      if (assignment.dueDate && format(parseISO(assignment.dueDate), 'yyyy-MM-dd') === dateStr) {
        dayEvents.push({
          ...assignment,
          type: 'assignment',
          color: getClassColor(assignment.subject),
          time: '23:59'
        });
      }
    });

    // Add calendar events
    events.forEach(event => {
      if (event.isMultiDay) {
        const startDate = parseISO(event.date);
        const endDate = parseISO(event.endDate);
        if (date >= startDate && date <= endDate) {
          dayEvents.push({
            ...event,
            type: 'event'
          });
        }
      } else if (format(parseISO(event.date), 'yyyy-MM-dd') === dateStr) {
        dayEvents.push({
          ...event,
          type: 'event'
        });
      }
    });

    // Add exams
    exams.forEach(exam => {
      if (format(parseISO(exam.date), 'yyyy-MM-dd') === dateStr) {
        dayEvents.push({
          ...exam,
          type: 'exam'
        });
      }
    });

    // Add class schedules
    const dayOfWeek = format(date, 'EEEE');
    schedules.forEach(schedule => {
      if (schedule.dayOfWeek === dayOfWeek) {
        const classInfo = classes.find(c => c.Id === schedule.classId);
        if (classInfo) {
          dayEvents.push({
            ...schedule,
            title: `${classInfo.name} - ${classInfo.subject}`,
            type: 'class',
            color: getClassColor(classInfo.subject),
            className: classInfo.name,
            subject: classInfo.subject,
            time: schedule.startTime
          });
        }
      }
    });

    return dayEvents.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
  };

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={day.toString()}
          className={`
            min-h-[120px] border border-gray-200 p-2 cursor-pointer transition-colors
            ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
            ${isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''}
            ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
          `}
          onClick={() => setSelectedDate(day)}
        >
          <div className={`font-medium text-sm mb-1 ${isCurrentDay ? 'text-blue-600' : ''}`}>
            {format(day, 'd')}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={`${event.Id}-${idx}`}
                className="text-xs p-1 rounded truncate"
                style={{ 
                  backgroundColor: `${event.color}20`,
                  color: event.color,
                  borderLeft: `3px solid ${event.color}`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (event.type === 'assignment') {
                    navigate(`/assignments/${event.Id}`);
                  }
                }}
              >
                {event.type === 'assignment' && <ApperIcon name="FileText" className="w-3 h-3 inline mr-1" />}
                {event.type === 'exam' && <ApperIcon name="GraduationCap" className="w-3 h-3 inline mr-1" />}
                {event.type === 'class' && <ApperIcon name="Users" className="w-3 h-3 inline mr-1" />}
                {event.type === 'event' && <ApperIcon name="Star" className="w-3 h-3 inline mr-1" />}
                {event.title}
                {event.time && event.time !== '23:59' && (
                  <span className="block text-xs opacity-75">{event.time}</span>
                )}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      
      day = addDays(day, 1);
    }

    return days;
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const dayEvents = getEventsForDate(selectedDate);
    
    return (
      <Card className="mt-6 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ApperIcon name="Calendar" className="w-5 h-5 mr-2" />
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        
        {dayEvents.length === 0 ? (
          <Empty 
            icon="Calendar"
            title="No events this day"
            description="Nothing scheduled for this date"
          />
        ) : (
          <div className="space-y-3">
            {dayEvents.map((event, idx) => (
              <div
                key={`${event.Id}-${idx}`}
                className={`
                  p-4 rounded-lg border-l-4 hover:shadow-md transition-shadow
                  ${event.type === 'assignment' ? 'cursor-pointer' : ''}
                `}
                style={{ 
                  backgroundColor: `${event.color}10`,
                  borderLeftColor: event.color
                }}
                onClick={() => {
                  if (event.type === 'assignment') {
                    navigate(`/assignments/${event.Id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {event.type === 'assignment' && <ApperIcon name="FileText" className="w-4 h-4" />}
                      {event.type === 'exam' && <ApperIcon name="GraduationCap" className="w-4 h-4" />}
                      {event.type === 'class' && <ApperIcon name="Users" className="w-4 h-4" />}
                      {event.type === 'event' && <ApperIcon name="Star" className="w-4 h-4" />}
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                    </div>
                    
                    {event.subject && (
                      <p className="text-sm text-gray-600 mt-1">{event.subject}</p>
                    )}
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    
                    {event.room && (
                      <p className="text-xs text-gray-500 mt-1">Room: {event.room}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant={
                        event.type === 'assignment' ? 'warning' :
                        event.type === 'exam' ? 'destructive' :
                        event.type === 'class' ? 'info' : 'default'
                      }
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                    
                    {event.time && (
                      <div className="text-xs text-gray-500 mt-1">
                        {event.time === '23:59' ? 'Due' : event.time}
                        {event.endTime && ` - ${event.endTime}`}
                      </div>
                    )}
                    
                    {event.points && (
                      <div className="text-xs text-gray-500 mt-1">
                        {event.points} points
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView error={error} onRetry={loadCalendarData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-gray-600 mt-2">
            {currentRole === "teacher" 
              ? "View assignment due dates, class schedules, and school events" 
              : "Track assignments, exams, and important dates"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ApperIcon name="ChevronLeft" className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ApperIcon name="ChevronRight" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded border-l-4 border-l-blue-500 bg-blue-100"></div>
              <span>Assignments</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded border-l-4 border-l-red-500 bg-red-100"></div>
              <span>Exams</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded border-l-4 border-l-green-500 bg-green-100"></div>
              <span>Classes</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded border-l-4 border-l-purple-500 bg-purple-100"></div>
              <span>Events</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-100 p-3 text-center font-medium text-gray-700 border-b border-gray-200">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {renderCalendarDays()}
        </div>
      </Card>

      {/* Selected Date Details */}
      {renderSelectedDateDetails()}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="FileText" className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
              <div className="text-sm text-gray-600">Assignments This Month</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ApperIcon name="GraduationCap" className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{exams.length}</div>
              <div className="text-sm text-gray-600">Exams & Projects</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="Users" className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{classes.length}</div>
              <div className="text-sm text-gray-600">Active Classes</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ApperIcon name="Star" className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{events.length}</div>
              <div className="text-sm text-gray-600">School Events</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;