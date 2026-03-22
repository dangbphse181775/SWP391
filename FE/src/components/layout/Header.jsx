import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, LogOut, LayoutDashboard, ClipboardCheck, CreditCard, Scale, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRolePath } from '@/hooks/useRolePath';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import orderApi from '@/service/orderApi';
import disputeApi from '@/service/disputeApi';
import WindowChat from '@/components/WindowChat';

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '');
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { getPath, getHomePath } = useRolePath();

  // Dispute chat state
  const [disputes, setDisputes] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { disputeId, channel }
  const [showDisputeDropdown, setShowDisputeDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const signalRRef = useRef(null);
  const disputeIdsRef = useRef([]);

  const isBuyerOrSeller = isAuthenticated &&
    user?.role?.toLowerCase() !== 'admin' &&
    user?.role?.toLowerCase() !== 'inspector';

  // Fetch disputed orders and their dispute details
  const fetchDisputes = useCallback(async () => {
    if (!isBuyerOrSeller) return;
    try {
      const [buyerRes, sellerRes] = await Promise.all([
        orderApi.getMyOrders().catch(() => ({ data: [] })),
        orderApi.getMySellerOrders().catch(() => ({ data: [] })),
      ]);
      const buyerOrders = (Array.isArray(buyerRes?.data) ? buyerRes.data : Array.isArray(buyerRes) ? buyerRes : []);
      const sellerOrders = (Array.isArray(sellerRes?.data) ? sellerRes.data : Array.isArray(sellerRes) ? sellerRes : []);

      const disputedOrders = [
        ...buyerOrders.filter(o => o?.status?.toLowerCase() === 'disputed').map(o => ({ ...o, _role: 'buyer' })),
        ...sellerOrders.filter(o => o?.status?.toLowerCase() === 'disputed').map(o => ({ ...o, _role: 'seller' })),
      ];

      const disputeDetails = await Promise.all(
        disputedOrders.map(async (order) => {
          try {
            // First get disputeId from order
            const orderRes = await disputeApi.getDisputeByOrder(order.orderId);
            const brief = orderRes?.data?.data || orderRes?.data;
            if (!brief?.disputeId) return null;
            // Then get full detail (includes chats based on role)
            const detailRes = await disputeApi.getDisputeDetail(brief.disputeId);
            const d = detailRes?.data?.data || detailRes?.data;
            return d ? { ...d, _role: order._role } : null;
          } catch { return null; }
        })
      );

      setDisputes(disputeDetails.filter(Boolean));
    } catch { /* ignore */ }
  }, [isBuyerOrSeller]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  // Keep disputeIdsRef in sync
  useEffect(() => {
    disputeIdsRef.current = disputes.map((d) => ({ disputeId: d.disputeId, _role: d._role }));
  }, [disputes]);

  // SignalR: listen for new messages in real-time
  useEffect(() => {
    if (!isBuyerOrSeller) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/dispute-chat`, {
        accessTokenFactory: () => localStorage.getItem('access_token'),
      })
      .withAutomaticReconnect()
      .build();

    signalRRef.current = connection;

    connection.on('ReceiveMessage', (msg) => {
      // If message is from someone else, re-fetch to update badge
      if (msg.senderId !== user?.userId) {
        fetchDisputes();
      }
    });

    const joinAll = async () => {
      for (const d of disputeIdsRef.current) {
        try {
          await connection.invoke('JoinDisputeChannel', d.disputeId, d._role);
        } catch { /* ignore */ }
      }
    };

    connection.onreconnected(() => joinAll());

    connection.start().then(() => joinAll()).catch(() => {});

    return () => {
      connection.stop();
      signalRRef.current = null;
    };
  }, [isBuyerOrSeller, user?.userId, fetchDisputes]);

  // Join new dispute channels when disputes list changes
  useEffect(() => {
    const conn = signalRRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    disputes.forEach((d) => {
      conn.invoke('JoinDisputeChannel', d.disputeId, d._role).catch(() => {});
    });
  }, [disputes]);

  // Compute unread count: only disputes where last message is NOT from current user
  const getLastMessage = (dispute) => {
    const chats = dispute._role === 'buyer' ? dispute.buyerChats : dispute.sellerChats;
    if (!Array.isArray(chats) || chats.length === 0) return null;
    return chats[chats.length - 1];
  };

  const unreadCount = disputes.filter((d) => {
    const last = getLastMessage(d);
    return last && last.senderId !== user?.userId;
  }).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDisputeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(getHomePath());
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công', {
      duration: 2000,
    });
    navigate('/');
  };

  const handleSellClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(getPath('sell'));
    } else {
      toast.error('Vui lòng đăng nhập để bán xe', {
        duration: 2000,
      });
      navigate('/login');
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" onClick={handleHomeClick} className="flex items-center gap-2">
            <img
              src="/Cycling-race-silhouette-logo-vector-icon-Graphics-5229446-1 (1).jpg"
              alt="Dap House Logo"
              className="w-12 h-10 object-contain"
            />
            <span className="text-lg font-semibold italic">Đạp House</span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" onClick={handleHomeClick} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Trang chủ
            </a>
            <Link to={isAuthenticated ? getPath('products') : '/products'} className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Sản phẩm
            </Link>
            <Link to="/community" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Cộng đồng
            </Link>
            <a
              href="#"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
              onClick={handleSellClick}
            >
              Bán xe
            </a>
            <Link to="/contact" className="text-sm font-semibold text-gray-900 hover:text-blue-600">
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  onClick={() => navigate(getPath('wishlist'))}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => navigate(getPath('Cart'))}
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                {user?.role?.toLowerCase() !== 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                    onClick={() => navigate(getPath('wallet'))}
                  >
                    <CreditCard className="h-5 w-5" />
                  </Button>
                )}
                {/* Dispute Chat Icon */}
                {isBuyerOrSeller && disputes.length > 0 && (
                  <div className="relative hidden md:flex" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDisputeDropdown((v) => !v)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                    {showDisputeDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                        <div className="px-3 py-2 border-b font-semibold text-sm text-gray-700">
                          Tin nhắn khiếu nại
                        </div>
                        {disputes.map((d) => {
                          const last = getLastMessage(d);
                          const isUnread = last && last.senderId !== user?.userId;
                          return (
                            <button
                              key={d.disputeId}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 flex flex-col gap-0.5 ${isUnread ? 'bg-blue-50' : ''}`}
                              onClick={() => {
                                setActiveChat({ disputeId: d.disputeId, channel: d._role });
                                setShowDisputeDropdown(false);
                              }}
                            >
                              <span className="text-sm font-medium flex items-center gap-1">
                                {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                                Đơn #{d.orderId} — {d.vehicles?.[0]?.vehicleName || 'Xe'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Trạng thái: {d.status} • Vai trò: {d._role === 'buyer' ? 'Người mua' : 'Người bán'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || 'Tài khoản'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role?.toLowerCase() === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/disputes')}>
                        <Scale className="mr-2 h-4 w-4" />
                        <span>Khiếu nại</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role?.toLowerCase() === 'inspector' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/inspector/inspection')}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        <span>Kiểm định xe</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/inspector/disputes')}>
                        <Scale className="mr-2 h-4 w-4" />
                        <span>Khiếu nại</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate(getPath('profile'))}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(getPath('wishlist'))}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Yêu thích</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  Đăng nhập
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>

    {/* WindowChat for active dispute */}
    {activeChat && (
      <WindowChat
        disputeId={activeChat.disputeId}
        channel={activeChat.channel}
        onClose={() => { setActiveChat(null); fetchDisputes(); }}
        onMessageSent={fetchDisputes}
      />
    )}
    </>
  );
};

export default Header;