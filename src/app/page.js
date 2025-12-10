"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  MoreVertical,
  CreditCard,
  Wifi,
  Database,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

/**
 * ==================================================================================
 * MOCK NEON DATABASE LAYER
 * ----------------------------------------------------------------------------------
 * In a real production environment, this section would be replaced by the 
 * @neondatabase/serverless driver.
 * * Example Real Implementation:
 * import { neon } from '@neondatabase/serverless';
 * const sql = neon(process.env.DATABASE_URL);
 * * const getRooms = async () => await sql`SELECT * FROM rooms`;
 * ==================================================================================
 */

const MOCK_DB = {
  rooms: [
    { id: 101, number: '101', type: 'Standard', price: 120, status: 'occupied', floor: 1, capacity: 2 },
    { id: 102, number: '102', type: 'Standard', price: 120, status: 'cleaning', floor: 1, capacity: 2 },
    { id: 103, number: '103', type: 'Deluxe', price: 180, status: 'available', floor: 1, capacity: 3 },
    { id: 104, number: '104', type: 'Deluxe', price: 180, status: 'maintenance', floor: 1, capacity: 3 },
    { id: 201, number: '201', type: 'Suite', price: 350, status: 'available', floor: 2, capacity: 4 },
    { id: 202, number: '202', type: 'Suite', price: 350, status: 'occupied', floor: 2, capacity: 4 },
    { id: 203, number: '203', type: 'Standard', price: 120, status: 'available', floor: 2, capacity: 2 },
    { id: 204, number: '204', type: 'Standard', price: 120, status: 'available', floor: 2, capacity: 2 },
  ],
  bookings: [
    { id: 'BK-7821', guestId: 1, roomId: 101, guestName: 'Jason Ruiz', checkIn: '2023-10-25', checkOut: '2023-10-29', status: 'checked-in', total: 480 },
    { id: 'BK-7822', guestId: 2, roomId: 202, guestName: 'Vivianna', checkIn: '2023-10-26', checkOut: '2023-10-28', status: 'checked-in', total: 700 },
    { id: 'BK-7823', guestId: 3, roomId: 103, guestName: 'Sarah Connor', checkIn: '2023-11-01', checkOut: '2023-11-05', status: 'confirmed', total: 720 },
  ],
  logs: [
    { id: 1, action: 'SYSTEM_INIT', details: 'Database connection established (Neon/PostgreSQL)', timestamp: new Date(Date.now() - 1000000).toISOString() },
    { id: 2, action: 'AUTH_LOGIN', details: 'Admin user logged in from IP 192.168.1.42', timestamp: new Date(Date.now() - 500000).toISOString() },
    { id: 3, action: 'UPDATE_ROOM', details: 'Room 102 status set to CLEANING', timestamp: new Date(Date.now() - 200000).toISOString() },
  ]
};

// Simulation delay to mimic network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const dbService = {
  getRooms: async () => {
    await delay(300);
    return [...MOCK_DB.rooms];
  },
  getBookings: async () => {
    await delay(300);
    return [...MOCK_DB.bookings];
  },
  getLogs: async () => {
    await delay(200);
    return [...MOCK_DB.logs];
  },
  updateRoomStatus: async (roomId, status) => {
    await delay(300);
    const room = MOCK_DB.rooms.find(r => r.id === roomId);
    if (room) {
      room.status = status;
      MOCK_DB.logs.unshift({
        id: Date.now(),
        action: 'UPDATE_ROOM',
        details: `Room ${room.number} status updated to ${status.toUpperCase()}`,
        timestamp: new Date().toISOString()
      });
    }
    return room;
  },
  createBooking: async (bookingData) => {
    await delay(500);
    const newBooking = {
      id: `BK-${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'confirmed',
      ...bookingData
    };
    MOCK_DB.bookings.unshift(newBooking);
    
    // Update room status automatically to mimic a trigger
    const room = MOCK_DB.rooms.find(r => r.id === parseInt(bookingData.roomId));
    if (room) room.status = 'occupied';
    
    MOCK_DB.logs.unshift({
      id: Date.now(),
      action: 'INSERT_BOOKING',
      details: `New reservation created for ${bookingData.guestName}`,
      timestamp: new Date().toISOString()
    });
    return newBooking;
  }
};

/**
 * ==================================================================================
 * UI COMPONENTS
 * ==================================================================================
 */

const StatusBadge = ({ status }) => {
  const styles = {
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    occupied: 'bg-rose-100 text-rose-800 border-rose-200',
    cleaning: 'bg-amber-100 text-amber-800 border-amber-200',
    maintenance: 'bg-gray-100 text-gray-800 border-gray-200',
    'checked-in': 'bg-blue-100 text-blue-800 border-blue-200',
    'confirmed': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'checked-out': 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const icons = {
    available: <CheckCircle2 className="w-3 h-3 mr-1" />,
    occupied: <XCircle className="w-3 h-3 mr-1" />,
    cleaning: <Clock className="w-3 h-3 mr-1" />,
    maintenance: <Settings className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.available}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// --- View: Dashboard ---
const Dashboard = ({ rooms, bookings }) => {
  const stats = [
    { label: 'Total Revenue (Mo)', value: ',593', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Occupancy Rate', value: `${Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100)}%`, icon: users => <Users className={users} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Check-ins', value: '4', icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Rooms to Clean', value: rooms.filter(r => r.status === 'cleaning').length, icon: BedDouble, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              {typeof stat.icon === 'function' ? stat.icon(`w-6 h-6 ${stat.color}`) : <stat.icon className={`w-6 h-6 ${stat.color}`} />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity / System Logs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Today&apos;s Check-ins</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.filter(b => b.status === 'confirmed').slice(0, 3).map((booking) => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {booking.guestName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{booking.guestName}</p>
                    <p className="text-xs text-slate-500">Room {booking.roomId} • {booking.id}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Check In
                </button>
              </div>
            ))}
            {bookings.filter(b => b.status === 'confirmed').length === 0 && (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">No pending check-ins for today.</div>
            )}
          </div>
        </div>

        {/* Room Status Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Room Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {['available', 'occupied', 'cleaning', 'maintenance'].map((status) => {
                const count = rooms.filter(r => r.status === status).length;
                const total = rooms.length;
                const percent = (count / total) * 100;
                
                const colors = {
                  available: 'bg-emerald-500',
                  occupied: 'bg-rose-500',
                  cleaning: 'bg-amber-500',
                  maintenance: 'bg-gray-400',
                };

                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-slate-700">{status}</span>
                      <span className="text-slate-500">{count} / {total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[status]}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- View: Rooms ---
const RoomGrid = ({ rooms, onUpdateStatus }) => {
  const [filter, setFilter] = useState('all');

  const filteredRooms = useMemo(() => {
    if (filter === 'all') return rooms;
    return rooms.filter(r => r.status === filter);
  }, [rooms, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900">Room Management</h2>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
          {['all', 'available', 'occupied', 'cleaning', 'maintenance'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map(room => (
          <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Room {room.number}</h3>
                <p className="text-sm text-slate-500">{room.type}</p>
              </div>
              <StatusBadge status={room.status} />
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Floor:</span>
                <span className="text-slate-900 font-medium">{room.floor}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Capacity:</span>
                <span className="text-slate-900 font-medium">{room.capacity} Guests</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Rate:</span>
                <span className="text-slate-900 font-medium">${room.price}/night</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
               {/* Quick Actions */}
               {room.status === 'cleaning' ? (
                 <button 
                  onClick={() => onUpdateStatus(room.id, 'available')}
                  className="col-span-2 w-full py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                 >
                   Mark Ready
                 </button>
               ) : room.status === 'available' ? (
                 <>
                   <button 
                    onClick={() => onUpdateStatus(room.id, 'cleaning')}
                    className="py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                   >
                     Clean
                   </button>
                   <button 
                    onClick={() => onUpdateStatus(room.id, 'maintenance')}
                    className="py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                   >
                     Maintain
                   </button>
                 </>
               ) : (
                 <button className="col-span-2 w-full py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed">
                   Occupied
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- View: Bookings/Front Desk ---
const BookingList = ({ bookings, onAddBooking }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">Front Desk & Reservations</h2>
        <button 
          onClick={onAddBooking}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Booking ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Guest</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Room</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Dates</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{booking.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
                        {booking.guestName.charAt(0)}
                      </div>
                      {booking.guestName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">Room {booking.roomId}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">${booking.total}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- View: System Logs (IT View) ---
const SystemLogs = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          System & Database Logs
        </h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-mono rounded border border-green-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
          DB_CONN: CONNECTED
        </span>
      </div>

      <div className="bg-slate-900 text-slate-200 rounded-xl overflow-hidden font-mono text-sm shadow-lg">
        <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
          <span>/var/log/neon-postgres.log</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="p-6 space-y-2 h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`font-bold shrink-0 ${
                log.action === 'ERROR' ? 'text-red-400' : 
                log.action === 'AUTH_LOGIN' ? 'text-yellow-400' : 
                'text-blue-400'
              }`}>[{log.action}]</span>
              <span className="text-slate-300 break-all">{log.details}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Component: Modal ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
const HotelApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
  
  // Modal State
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    guestName: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
  });

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const [r, b, l] = await Promise.all([
        dbService.getRooms(),
        dbService.getBookings(),
        dbService.getLogs()
      ]);
      setRooms(r);
      setBookings(b);
      setLogs(l);
      setLoading(false);
    };
    initData();
  }, []);

  const handleUpdateRoomStatus = async (id, status) => {
    // Optimistic update
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    // DB Call
    await dbService.updateRoomStatus(id, status);
    
    // Refresh Logs
    const newLogs = await dbService.getLogs();
    setLogs(newLogs);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!newBookingData.roomId || !newBookingData.guestName) return;

    // Calculate dummy total
    const room = rooms.find(r => r.id === parseInt(newBookingData.roomId));
    const total = room ? room.price * 2 : 200; // Simplified calculation

    const bookingPayload = {
      ...newBookingData,
      total,
      guestId: Math.floor(Math.random() * 1000)
    };

    const created = await dbService.createBooking(bookingPayload);
    setBookings(prev => [created, ...prev]);
    setRooms(prev => prev.map(r => r.id === parseInt(created.roomId) ? { ...r, status: 'occupied' } : r));
    
    const newLogs = await dbService.getLogs();
    setLogs(newLogs);
    
    setBookingModalOpen(false);
    setNewBookingData({ guestName: '', roomId: '', checkIn: '', checkOut: '' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'front-desk', label: 'Front Desk', icon: CalendarDays },
    { id: 'rooms', label: 'Rooms', icon: BedDouble },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'logs', label: 'System Logs', icon: Database },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-medium text-slate-600 animate-pulse">Connecting to Neon DB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <h1 className="text-xl font-bold text-white tracking-tight">HotelOS</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
              JR
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Jason Ruiz</p>
              <p className="text-xs text-slate-500">SysAdmin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-900 text-white z-40 px-4 py-3 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center font-bold">H</div>
            <span className="font-bold">HotelOS</span>
         </div>
         <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
           {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 bg-slate-900 h-full p-4 pt-16" onClick={e => e.stopPropagation()}>
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
                    currentView === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
        {currentView === 'dashboard' && <Dashboard rooms={rooms} bookings={bookings} />}
        {currentView === 'rooms' && <RoomGrid rooms={rooms} onUpdateStatus={handleUpdateRoomStatus} />}
        {currentView === 'front-desk' && <BookingList bookings={bookings} onAddBooking={() => setBookingModalOpen(true)} />}
        {currentView === 'guests' && (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Guest Directory</h3>
            <p className="text-slate-500">Feature currently under maintenance by IT.</p>
          </div>
        )}
        {currentView === 'logs' && <SystemLogs logs={logs} />}
      </main>

      {/* New Booking Modal */}
      <Modal 
        isOpen={isBookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
        title="New Reservation"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Guest Name</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
              placeholder="Enter guest name"
              value={newBookingData.guestName}
              onChange={e => setNewBookingData({...newBookingData, guestName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Room Selection</label>
            <select 
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              value={newBookingData.roomId}
              onChange={e => setNewBookingData({...newBookingData, roomId: e.target.value})}
            >
              <option value="">Select a room...</option>
              {rooms.filter(r => r.status === 'available').map(r => (
                <option key={r.id} value={r.id}>
                  Room {r.number} ({r.type}) - ${r.price}/night
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Check In</label>
              <input 
                required
                type="date" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newBookingData.checkIn}
                onChange={e => setNewBookingData({...newBookingData, checkIn: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Check Out</label>
              <input 
                required
                type="date" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={newBookingData.checkOut}
                onChange={e => setNewBookingData({...newBookingData, checkOut: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => setBookingModalOpen(false)}
              className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 text-white bg-indigo-600 font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default HotelApp;
