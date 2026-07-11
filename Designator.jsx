import React, { useState, useEffect, useRef } from 'react';
import {
  Sofa, Bed, ChefHat, Bath, UtensilsCrossed, Table, Car, DoorOpen, Ruler,
  Plus, X, RotateCw, Trash2, RefreshCw, Check, Info, Package, BookOpen,
  Tv, Armchair, Refrigerator, Flame, Droplets, Palette,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Menu, ArrowRight, Save, Smartphone, Lock, Sparkles, Star,
} from 'lucide-react';

/* ============================== CONSTANTS ============================== */

const PLAN_SCALE = 16;
const CANVAS_FT_W = 48;
const CANVAS_FT_H = 32;
const CANVAS_PX_W = CANVAS_FT_W * PLAN_SCALE;
const CANVAS_PX_H = CANVAS_FT_H * PLAN_SCALE;
const GRID_SNAP = 0.5;
const MIN_ROOM_FT = 5;
const FREE_ROOM_LIMIT = 3;
const ROOMS_STORAGE_KEY = 'df-rooms-v1';
const PLAN_STORAGE_KEY = 'df-plan-v1';

const ROOM_TYPES = [
  { id: 'living',   name: 'Living Room', icon: Sofa,           w: 16, h: 14, wall: '#C1613D', floor: 'oak' },
  { id: 'bedroom',  name: 'Bedroom',     icon: Bed,            w: 12, h: 12, wall: '#7C9070', floor: 'walnut' },
  { id: 'kitchen',  name: 'Kitchen',     icon: ChefHat,        w: 12, h: 10, wall: '#FFFFFF', floor: 'white-tile' },
  { id: 'bathroom', name: 'Bathroom',    icon: Bath,           w: 8,  h: 7,  wall: '#5B87A8', floor: 'grey-tile' },
  { id: 'dining',   name: 'Dining Room', icon: UtensilsCrossed,w: 12, h: 10, wall: '#B8863B', floor: 'oak' },
  { id: 'office',   name: 'Office',      icon: Table,          w: 10, h: 10, wall: '#8C7A66', floor: 'walnut' },
  { id: 'garage',   name: 'Garage',      icon: Car,            w: 20, h: 12, wall: '#C9BBA5', floor: 'concrete' },
  { id: 'hallway',  name: 'Hallway',     icon: Ruler,          w: 4,  h: 12, wall: '#E8E2D4', floor: 'espresso' },
];

const FLOOR_OPTIONS = [
  { id: 'oak',          label: 'Oak',          material: 'wood',    color: '#C9A66B' },
  { id: 'walnut',       label: 'Walnut',       material: 'wood',    color: '#8B6544' },
  { id: 'espresso',     label: 'Espresso',     material: 'wood',    color: '#4A3524' },
  { id: 'white-tile',   label: 'White Tile',   material: 'tile',    color: '#EDEAE4' },
  { id: 'grey-tile',    label: 'Grey Tile',    material: 'tile',    color: '#B8BEC2' },
  { id: 'cream-carpet', label: 'Cream Carpet', material: 'carpet',  color: '#D9CFBF', premium: true },
  { id: 'navy-carpet',  label: 'Navy Carpet',  material: 'carpet',  color: '#3A4A5C', premium: true },
  { id: 'concrete',     label: 'Concrete',     material: 'concrete',color: '#A8A29B', premium: true },
];

const WALL_COLORS = ['#FFFFFF', '#E8E2D4', '#C9BBA5', '#8C7A66', '#5B87A8', '#7C9070', '#B8863B', '#C1613D', '#2B4C7E', '#1E2A38'];

const FURNITURE_TYPES = [
  { id: 'bed',           name: 'Bed',           icon: Bed,            w: 5,   h: 6.5, cat: 'Sleep & Storage' },
  { id: 'nightstand',    name: 'Nightstand',    icon: Package,        w: 1.5, h: 1.5, cat: 'Sleep & Storage' },
  { id: 'wardrobe',      name: 'Wardrobe',      icon: Package,        w: 4,   h: 2,   cat: 'Sleep & Storage' },
  { id: 'bookshelf',     name: 'Bookshelf',     icon: BookOpen,       w: 3,   h: 1.2, cat: 'Sleep & Storage' },
  { id: 'sofa',          name: 'Sofa',          icon: Sofa,           w: 7,   h: 3,   cat: 'Seating & Living' },
  { id: 'armchair',      name: 'Armchair',      icon: Armchair,       w: 3,   h: 3,   cat: 'Seating & Living' },
  { id: 'coffee-table',  name: 'Coffee Table',  icon: Table,          w: 4,   h: 2,   cat: 'Seating & Living' },
  { id: 'tv-stand',      name: 'TV Stand',      icon: Tv,             w: 5,   h: 1.5, cat: 'Seating & Living' },
  { id: 'dining-table',  name: 'Dining Table',  icon: Table,          w: 5,   h: 3.5, cat: 'Dining & Kitchen' },
  { id: 'dining-chair',  name: 'Dining Chair',  icon: Armchair,       w: 1.5, h: 1.5, cat: 'Dining & Kitchen' },
  { id: 'counter',       name: 'Counter',       icon: UtensilsCrossed,w: 6,   h: 2,   cat: 'Dining & Kitchen' },
  { id: 'fridge',        name: 'Fridge',        icon: Refrigerator,   w: 3,   h: 3,   cat: 'Dining & Kitchen' },
  { id: 'stove',         name: 'Stove',         icon: Flame,          w: 2.5, h: 2.5, cat: 'Dining & Kitchen' },
  { id: 'sink',          name: 'Sink',          icon: Droplets,       w: 2,   h: 1.5, cat: 'Bath' },
  { id: 'toilet',        name: 'Toilet',        icon: Droplets,       w: 2,   h: 2.5, cat: 'Bath' },
  { id: 'bathtub',       name: 'Bathtub',       icon: Bath,           w: 5,   h: 2.5, cat: 'Bath' },
  { id: 'desk',          name: 'Desk',          icon: Table,          w: 4,   h: 2,   cat: 'Work & Other' },
  { id: 'office-chair',  name: 'Office Chair',  icon: Armchair,       w: 2,   h: 2,   cat: 'Work & Other' },
];

const CAT_COLORS = {
  'Sleep & Storage': '#8B6544',
  'Seating & Living': '#B8863B',
  'Dining & Kitchen': '#7C9070',
  'Bath': '#5B87A8',
  'Work & Other': '#BD5B3A',
};

const DOOR_SIDES = [
  { id: 'top',    label: 'N', icon: ChevronUp },
  { id: 'right',  label: 'E', icon: ChevronRight },
  { id: 'bottom', label: 'S', icon: ChevronDown },
  { id: 'left',   label: 'W', icon: ChevronLeft },
];

const DEFAULT_ROOMS = [
  { id: 'r-living',   typeId: 'living',   name: 'Living Room', xFt: 2,  yFt: 2,  wFt: 16, hFt: 14, doorSide: 'right', wall: '#C1613D', floor: 'oak',
    furniture: [
      { id: 'f1', typeId: 'sofa', xFt: 1, yFt: 1, rotation: 0 },
      { id: 'f2', typeId: 'coffee-table', xFt: 2, yFt: 5, rotation: 0 },
      { id: 'f3', typeId: 'tv-stand', xFt: 1, yFt: 12, rotation: 0 },
    ] },
  { id: 'r-kitchen',  typeId: 'kitchen',  name: 'Kitchen',     xFt: 20, yFt: 2,  wFt: 12, hFt: 10, doorSide: 'left', wall: '#FFFFFF', floor: 'white-tile',
    furniture: [
      { id: 'f4', typeId: 'counter', xFt: 1, yFt: 1, rotation: 0 },
      { id: 'f5', typeId: 'fridge', xFt: 8, yFt: 1, rotation: 0 },
    ] },
  { id: 'r-bedroom',  typeId: 'bedroom',  name: 'Bedroom',     xFt: 2,  yFt: 18, wFt: 14, hFt: 12, doorSide: 'right', wall: '#7C9070', floor: 'walnut',
    furniture: [
      { id: 'f6', typeId: 'bed', xFt: 1, yFt: 1, rotation: 0 },
      { id: 'f7', typeId: 'nightstand', xFt: 6.5, yFt: 1, rotation: 0 },
    ] },
  { id: 'r-bathroom', typeId: 'bathroom', name: 'Bathroom',    xFt: 18, yFt: 18, wFt: 8,  hFt: 8,  doorSide: 'left', wall: '#5B87A8', floor: 'grey-tile', furniture: [] },
];

const PRICING_PLANS = [
  { id: 'free', name: 'Free', tagline: 'Try it out, no card needed', priceMonthly: 0, priceYearly: 0,
    features: ['Up to 3 rooms', 'Wood & tile flooring', 'Full furniture catalog', 'Autosaves in your browser'],
    cta: 'Start free', highlight: false },
  { id: 'pro', name: 'Pro', tagline: 'For your own home', priceMonthly: 9, priceYearly: 90,
    features: ['Unlimited rooms', 'Every flooring material', 'Full furniture catalog', 'No "made with" badge', 'Email support'],
    cta: 'Go Pro', highlight: true },
  { id: 'studio', name: 'Studio', tagline: 'For designers & agents', priceMonthly: 29, priceYearly: 290,
    features: ['Everything in Pro', 'Commercial use license', 'Priority support', 'Early access to new packs'],
    cta: 'Start Studio', highlight: false },
];

const FEATURE_CARDS = [
  { icon: Ruler, title: 'Blueprint floor planning', desc: 'Drop in rooms, drag to place them, and resize down to the half-foot on a true-to-scale lot.' },
  { icon: Palette, title: 'Full room styling', desc: 'Pick a wall color and flooring for every room from a real materials library.' },
  { icon: Sofa, title: '18-piece furniture catalog', desc: 'Furnish each room, then rotate and arrange pieces exactly how you want them.' },
  { icon: Save, title: 'Always saved', desc: 'Your plan saves automatically as you work, so you can pick up right where you left off.' },
  { icon: Smartphone, title: 'Any device', desc: 'Start a plan on your laptop and keep tweaking it from a tablet or phone.' },
  { icon: DoorOpen, title: 'Real dimensions', desc: 'Every room shows true square footage and a proper door placement.' },
];

const STEPS = [
  { n: '01', title: 'Lay the plan', desc: 'Add rooms to the lot, size them, and choose which wall the door sits on.' },
  { n: '02', title: 'Pick materials', desc: 'Set a wall color and flooring for each room from the materials library.' },
  { n: '03', title: 'Furnish it', desc: 'Drag in furniture, rotate pieces, and arrange the room until it feels right.' },
];

const FAQ_ITEMS = [
  { q: 'Do I need to install anything?', a: 'No — it runs right in your browser, on the free or paid plan.' },
  { q: 'Is my design saved?', a: 'Yes. Your plan autosaves in your browser as you work, so it\u2019s there when you come back.' },
  { q: 'What do I get on the free plan?', a: `Up to ${FREE_ROOM_LIMIT} rooms, the full furniture catalog, and wood or tile flooring — no card required.` },
  { q: 'Can I cancel anytime?', a: 'That\u2019s the idea for Pro and Studio — simple month-to-month billing with no lock-in.' },
  { q: 'Does it work on mobile?', a: 'The site and pricing pages adapt to smaller screens. The floor-plan canvas itself is easiest to use with a larger screen.' },
  { q: 'Can I export or print my plan?', a: 'Not yet — export is on our roadmap.' },
];

const TESTIMONIALS = [
  { quote: 'I finally understood how our new living room and kitchen would actually feel together before we broke ground.', name: 'A. Rivera', role: 'Homeowner' },
  { quote: 'Moved furniture around a dozen times without moving a single real couch.', name: 'J. Chen', role: 'First-time buyer' },
  { quote: 'I use it to walk clients through layout options before we ever call a contractor.', name: 'M. Okafor', role: 'Interior stylist' },
];

/* =============================== HELPERS =============================== */

let idCounter = 0;
function uid(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function snap(v) { return Math.round(v / GRID_SNAP) * GRID_SNAP; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function footprint(ftype, rotation) {
  if (!ftype) return { w: 1, h: 1 };
  return (rotation % 180 === 0) ? { w: ftype.w, h: ftype.h } : { w: ftype.h, h: ftype.w };
}

function shade(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * percent);
  let b = (num & 0xff) + Math.round(2.55 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function getFloorStyle(floorId) {
  const opt = FLOOR_OPTIONS.find((o) => o.id === floorId) || FLOOR_OPTIONS[0];
  const c = opt.color;
  if (opt.material === 'wood') {
    const dark = shade(c, -14);
    return { backgroundColor: c, backgroundImage: `repeating-linear-gradient(90deg, ${dark} 0px, ${dark} 1px, transparent 1px, transparent 22px)` };
  }
  if (opt.material === 'tile') {
    return { backgroundColor: c, backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 36px), repeating-linear-gradient(90deg, rgba(0,0,0,0.09) 0px, rgba(0,0,0,0.09) 1px, transparent 1px, transparent 36px)` };
  }
  if (opt.material === 'carpet') {
    return { backgroundColor: c, backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1.3px)', backgroundSize: '6px 6px' };
  }
  return { backgroundColor: c, backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 2px, transparent 2px, transparent 26px)' };
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

function getDecorateScale(room) {
  if (!room) return 30;
  const maxW = 560, maxH = 380;
  return Math.min(maxW / room.wFt, maxH / room.hFt, 46);
}

function doorStyle(side) {
  const base = { position: 'absolute', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B3A5C', border: '1.5px solid #CFE3F0', color: '#EAF4FB' };
  if (side === 'top') return { ...base, top: -10, left: '50%', transform: 'translateX(-50%)' };
  if (side === 'bottom') return { ...base, bottom: -10, left: '50%', transform: 'translateX(-50%)' };
  if (side === 'left') return { ...base, left: -10, top: '50%', transform: 'translateY(-50%)' };
  return { ...base, right: -10, top: '50%', transform: 'translateY(-50%)' };
}

/* =========================== FURNITURE ITEM ============================= */

function FurnitureItem({ item, scale, selected, onPointerDown, onRotate, onDelete }) {
  const ftype = FURNITURE_TYPES.find((t) => t.id === item.typeId);
  if (!ftype) return null;
  const fp = footprint(ftype, item.rotation);
  const Icon = ftype.icon;
  const pxW = fp.w * scale;
  const pxH = fp.h * scale;
  const iconSize = clamp(Math.min(pxW, pxH) * 0.4, 12, 40);

  return (
    <div
      className={`hb-furn-item${selected ? ' selected' : ''}`}
      style={{ left: item.xFt * scale, top: item.yFt * scale, width: pxW, height: pxH, background: CAT_COLORS[ftype.cat] || '#8B6544' }}
      onPointerDown={onPointerDown}
    >
      <Icon size={iconSize} style={{ transform: `rotate(${item.rotation}deg)`, flexShrink: 0 }} />
      {pxW > 54 && pxH > 24 && <span className="hb-furn-label">{ftype.name}</span>}
      {selected && (
        <div className="hb-furn-controls">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={onRotate} title="Rotate"><RotateCw size={12} /></button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={onDelete} title="Remove"><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );
}

/* =========================== HOUSE BUILDER APP =========================== */

function HouseBuilderApp({ plan, onRequireUpgrade, onExit }) {
  const [mode, setMode] = useState('build');
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [resetArmed, setResetArmed] = useState(false);
  const dragState = useRef(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;
  const decorateScale = getDecorateScale(selectedRoom);
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'studio' ? 'Studio' : 'Free';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(ROOMS_STORAGE_KEY, false);
        if (!cancelled && res && res.value) {
          const parsed = JSON.parse(res.value);
          if (Array.isArray(parsed)) setRooms(parsed);
        }
      } catch (e) {
        /* first run — keep starter layout */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus('saving');
    const t = setTimeout(async () => {
      try {
        const res = await window.storage.set(ROOMS_STORAGE_KEY, JSON.stringify(rooms), false);
        setSaveStatus(res ? 'saved' : 'error');
      } catch (e) {
        setSaveStatus('error');
      }
    }, 600);
    return () => clearTimeout(t);
  }, [rooms, hydrated]);

  useEffect(() => {
    if (selectedRoomId && !rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(rooms.length ? rooms[0].id : null);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    if (mode === 'decorate' && !selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [mode, rooms, selectedRoomId]);

  useEffect(() => { setSelectedFurnitureId(null); }, [selectedRoomId]);

  useEffect(() => {
    if (!resetArmed) return;
    const t = setTimeout(() => setResetArmed(false), 3000);
    return () => clearTimeout(t);
  }, [resetArmed]);

  useEffect(() => {
    function onMove(e) {
      const ds = dragState.current;
      if (!ds) return;
      if (ds.kind === 'room-move') {
        const dxFt = (e.clientX - ds.startX) / PLAN_SCALE;
        const dyFt = (e.clientY - ds.startY) / PLAN_SCALE;
        setRooms((rs) => rs.map((r) => r.id !== ds.id ? r : {
          ...r,
          xFt: clamp(snap(ds.origX + dxFt), 0, CANVAS_FT_W - r.wFt),
          yFt: clamp(snap(ds.origY + dyFt), 0, CANVAS_FT_H - r.hFt),
        }));
      } else if (ds.kind === 'room-resize') {
        const dxFt = (e.clientX - ds.startX) / PLAN_SCALE;
        const dyFt = (e.clientY - ds.startY) / PLAN_SCALE;
        setRooms((rs) => rs.map((r) => r.id !== ds.id ? r : {
          ...r,
          wFt: clamp(snap(ds.origW + dxFt), MIN_ROOM_FT, CANVAS_FT_W - r.xFt),
          hFt: clamp(snap(ds.origH + dyFt), MIN_ROOM_FT, CANVAS_FT_H - r.yFt),
        }));
      } else if (ds.kind === 'furniture-move') {
        const dxFt = (e.clientX - ds.startX) / ds.scale;
        const dyFt = (e.clientY - ds.startY) / ds.scale;
        setRooms((rs) => rs.map((r) => {
          if (r.id !== ds.roomId) return r;
          return {
            ...r,
            furniture: r.furniture.map((f) => {
              if (f.id !== ds.id) return f;
              const fp = footprint(ds.ftype, f.rotation);
              return {
                ...f,
                xFt: clamp(ds.origX + dxFt, 0, Math.max(0, r.wFt - fp.w)),
                yFt: clamp(ds.origY + dyFt, 0, Math.max(0, r.hFt - fp.h)),
              };
            }),
          };
        }));
      }
    }
    function onUp() { dragState.current = null; }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  function addRoom(typeId) {
    if (plan === 'free' && rooms.length >= FREE_ROOM_LIMIT) { onRequireUpgrade('pro'); return; }
    const t = ROOM_TYPES.find((r) => r.id === typeId);
    if (!t) return;
    const idx = rooms.length;
    const x = clamp(2 + (idx % 3) * 14, 0, Math.max(0, CANVAS_FT_W - t.w));
    const y = clamp(2 + Math.floor(idx / 3) * 12, 0, Math.max(0, CANVAS_FT_H - t.h));
    const newRoom = { id: uid('room'), typeId, name: t.name, xFt: x, yFt: y, wFt: t.w, hFt: t.h, doorSide: 'bottom', wall: t.wall, floor: t.floor, furniture: [] };
    setRooms((rs) => [...rs, newRoom]);
    setSelectedRoomId(newRoom.id);
    setMode('build');
  }

  function updateRoom(id, patch) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function pickFloor(room, floorOpt) {
    if (floorOpt.premium && plan === 'free') { onRequireUpgrade('pro'); return; }
    updateRoom(room.id, { floor: floorOpt.id });
  }

  function deleteRoom(id) {
    setRooms((rs) => rs.filter((r) => r.id !== id));
    if (selectedRoomId === id) setSelectedRoomId(null);
  }

  function addFurniture(roomId, typeId) {
    if (!roomId) return;
    const ft = FURNITURE_TYPES.find((f) => f.id === typeId);
    const room = rooms.find((r) => r.id === roomId);
    if (!ft || !room) return;
    const x = clamp(room.wFt / 2 - ft.w / 2, 0, Math.max(0, room.wFt - ft.w));
    const y = clamp(room.hFt / 2 - ft.h / 2, 0, Math.max(0, room.hFt - ft.h));
    const item = { id: uid('furn'), typeId, xFt: x, yFt: y, rotation: 0 };
    updateRoom(roomId, { furniture: [...room.furniture, item] });
    setSelectedFurnitureId(item.id);
  }

  function rotateFurniture(roomId, furnId) {
    setRooms((rs) => rs.map((r) => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        furniture: r.furniture.map((f) => {
          if (f.id !== furnId) return f;
          const newRot = (f.rotation + 90) % 360;
          const ftype = FURNITURE_TYPES.find((t) => t.id === f.typeId);
          const fp = footprint(ftype, newRot);
          return { ...f, rotation: newRot, xFt: clamp(f.xFt, 0, Math.max(0, r.wFt - fp.w)), yFt: clamp(f.yFt, 0, Math.max(0, r.hFt - fp.h)) };
        }),
      };
    }));
  }

  function deleteFurniture(roomId, furnId) {
    setRooms((rs) => rs.map((r) => (r.id !== roomId ? r : { ...r, furniture: r.furniture.filter((f) => f.id !== furnId) })));
    if (selectedFurnitureId === furnId) setSelectedFurnitureId(null);
  }

  function handleRoomPointerDown(e, room) {
    e.stopPropagation();
    setSelectedRoomId(room.id);
    dragState.current = { kind: 'room-move', id: room.id, startX: e.clientX, startY: e.clientY, origX: room.xFt, origY: room.yFt };
  }

  function handleResizePointerDown(e, room) {
    e.stopPropagation();
    dragState.current = { kind: 'room-resize', id: room.id, startX: e.clientX, startY: e.clientY, origW: room.wFt, origH: room.hFt };
  }

  function handleFurniturePointerDown(e, room, item) {
    e.stopPropagation();
    setSelectedFurnitureId(item.id);
    const ftype = FURNITURE_TYPES.find((t) => t.id === item.typeId);
    dragState.current = { kind: 'furniture-move', id: item.id, roomId: room.id, startX: e.clientX, startY: e.clientY, origX: item.xFt, origY: item.yFt, scale: decorateScale, ftype };
  }

  function handleReset() {
    if (!resetArmed) { setResetArmed(true); return; }
    setRooms([]);
    setSelectedRoomId(null);
    setSelectedFurnitureId(null);
    setResetArmed(false);
  }

  const totalSqft = rooms.reduce((s, r) => s + r.wFt * r.hFt, 0);
  const furnitureGroups = groupBy(FURNITURE_TYPES, 'cat');
  const selectedFurniture = selectedRoom ? selectedRoom.furniture.find((f) => f.id === selectedFurnitureId) : null;

  return (
    <div className="hb-app">
      {plan === 'free' && <div className="hb-watermark">Made with Drafting Table</div>}

      <div className="hb-header">
        <div className="hb-title-wrap">
          <button className="hb-back-link" onClick={onExit}><ChevronLeft size={14} /> Back to site</button>
          <span className="hb-title">Drafting Table</span>
          <span className="hb-subtitle">design the plan, then make it home</span>
        </div>
        <div className="hb-tabs">
          <button className={`hb-tab${mode === 'build' ? ' active' : ''}`} onClick={() => setMode('build')}>
            <Ruler size={14} /> Build
          </button>
          <button className={`hb-tab${mode === 'decorate' ? ' active' : ''}`} onClick={() => setMode('decorate')}>
            <Palette size={14} /> Decorate
          </button>
        </div>
        <div className="hb-stats-block">
          <div className="hb-stat">ROOMS<b>{rooms.length}</b></div>
          <div className="hb-stat">TOTAL AREA<b>{totalSqft.toLocaleString()} sqft</b></div>
          <div className={`hb-save-status${saveStatus === 'error' ? ' error' : ''}`}>
            {saveStatus === 'saving' && <><RefreshCw size={12} className="hb-spin" /> saving…</>}
            {saveStatus === 'saved' && <><Check size={12} /> saved</>}
            {saveStatus === 'error' && <><Info size={12} /> save failed</>}
          </div>
          <span className={`hb-plan-badge hb-plan-${plan}`}>{planLabel}</span>
          {plan === 'free' && <button className="hb-upgrade-btn" onClick={() => onRequireUpgrade('pro')}><Sparkles size={13} /> Upgrade</button>}
          <button className={`hb-reset-btn${resetArmed ? ' armed' : ''}`} onClick={handleReset}>
            <Trash2 size={13} /> {resetArmed ? 'Confirm clear' : 'Clear plan'}
          </button>
        </div>
      </div>

      {mode === 'build' && (
        <div className="hb-body">
          <div className="hb-sidebar">
            <div className="hb-sidebar-title">Add a room</div>
            <div className="hb-plan-note">
              {plan === 'free' ? (
                <>Free plan — {rooms.length}/{FREE_ROOM_LIMIT} rooms used.{rooms.length >= FREE_ROOM_LIMIT && <button className="hb-upgrade-link" onClick={() => onRequireUpgrade('pro')}>Upgrade for unlimited →</button>}</>
              ) : (
                <>{planLabel} plan — unlimited rooms</>
              )}
            </div>
            {ROOM_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} className="hb-palette-btn" onClick={() => addRoom(t.id)}>
                  <span className="hb-swatch" style={{ background: t.wall }} />
                  <Icon size={15} />
                  <span className="name">{t.name}</span>
                  <Plus size={13} />
                </button>
              );
            })}
          </div>

          <div className="hb-canvas-area">
            <div className="hb-canvas-wrap">
              <div className="hb-blueprint-canvas" onPointerDown={() => setSelectedRoomId(null)}>
                {rooms.map((room) => {
                  const selected = room.id === selectedRoomId;
                  return (
                    <div
                      key={room.id}
                      className={`hb-room${selected ? ' selected' : ''}`}
                      style={{ left: room.xFt * PLAN_SCALE, top: room.yFt * PLAN_SCALE, width: room.wFt * PLAN_SCALE, height: room.hFt * PLAN_SCALE }}
                      onPointerDown={(e) => handleRoomPointerDown(e, room)}
                    >
                      <div className="hb-room-label">
                        <div className="hb-room-name">{room.name}</div>
                        <div className="hb-room-dim">{room.wFt}' × {room.hFt}'</div>
                        <div className="hb-room-sqft">{Math.round(room.wFt * room.hFt)} sqft</div>
                      </div>
                      <div style={doorStyle(room.doorSide)}><DoorOpen size={12} /></div>
                      {selected && (
                        <>
                          <button
                            className="hb-room-delete"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                          ><X size={11} /></button>
                          <div className="hb-resize-handle" onPointerDown={(e) => handleResizePointerDown(e, room)} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hb-hint">Drag a room to move it, use the corner handle to resize, and set the door side in the panel. Lot size: {CANVAS_FT_W}' × {CANVAS_FT_H}'.</div>
          </div>

          <div className="hb-properties">
            {selectedRoom ? (
              <>
                <div className="hb-sidebar-title">Room details</div>
                <div className="hb-field">
                  <label>Name</label>
                  <input className="hb-input" type="text" value={selectedRoom.name} onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })} />
                </div>
                <div className="hb-dims-row">
                  <div className="hb-field" style={{ flex: 1 }}>
                    <label>Width (ft)</label>
                    <input className="hb-input" type="number" step="0.5" min={MIN_ROOM_FT} value={selectedRoom.wFt}
                      onChange={(e) => updateRoom(selectedRoom.id, { wFt: clamp(snap(parseFloat(e.target.value) || MIN_ROOM_FT), MIN_ROOM_FT, CANVAS_FT_W - selectedRoom.xFt) })} />
                  </div>
                  <div className="hb-field" style={{ flex: 1 }}>
                    <label>Depth (ft)</label>
                    <input className="hb-input" type="number" step="0.5" min={MIN_ROOM_FT} value={selectedRoom.hFt}
                      onChange={(e) => updateRoom(selectedRoom.id, { hFt: clamp(snap(parseFloat(e.target.value) || MIN_ROOM_FT), MIN_ROOM_FT, CANVAS_FT_H - selectedRoom.yFt) })} />
                  </div>
                </div>
                <div className="hb-field">
                  <label>Door side</label>
                  <div className="hb-door-row">
                    {DOOR_SIDES.map((d) => {
                      const Icon = d.icon;
                      return (
                        <button key={d.id} className={`hb-door-btn${selectedRoom.doorSide === d.id ? ' active' : ''}`} onClick={() => updateRoom(selectedRoom.id, { doorSide: d.id })}>
                          <Icon size={13} />{d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="hb-summary-row"><span>Area</span><span>{Math.round(selectedRoom.wFt * selectedRoom.hFt)} sqft</span></div>
                <div className="hb-summary-row"><span>Furniture</span><span>{selectedRoom.furniture.length} items</span></div>
                <button className="hb-delete-room-btn" onClick={() => deleteRoom(selectedRoom.id)}><Trash2 size={13} /> Delete room</button>
              </>
            ) : (
              <>
                <div className="hb-sidebar-title">Room details</div>
                <div className="hb-empty-hint">Add a room from the left panel, or click an existing room on the plan to rename it, resize it, or set its door.</div>
              </>
            )}
          </div>
        </div>
      )}

      {mode === 'decorate' && (
        <div>
          <div className="hb-room-chips">
            {rooms.map((r) => (
              <button key={r.id} className={`hb-room-chip${r.id === selectedRoomId ? ' active' : ''}`} onClick={() => setSelectedRoomId(r.id)}>
                <span className="hb-chip-dot" style={{ background: r.wall }} />
                {r.name}
              </button>
            ))}
          </div>

          <div className="hb-body">
            <div className="hb-sidebar">
              <div className="hb-sidebar-title">Add furniture</div>
              {Object.entries(furnitureGroups).map(([cat, items]) => (
                <div key={cat}>
                  <div className="hb-furn-cat-title">{cat}</div>
                  {items.map((it) => {
                    const Icon = it.icon;
                    return (
                      <button key={it.id} className="hb-palette-btn" disabled={!selectedRoom} onClick={() => addFurniture(selectedRoomId, it.id)}>
                        <Icon size={15} />
                        <span className="name">{it.name}</span>
                        <Plus size={13} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="hb-canvas-area">
              <div className="hb-decorate-stage">
                {selectedRoom ? (
                  <div
                    className="hb-decorate-room"
                    style={{ width: selectedRoom.wFt * decorateScale, height: selectedRoom.hFt * decorateScale, border: `10px solid ${selectedRoom.wall}`, boxSizing: 'content-box', ...getFloorStyle(selectedRoom.floor) }}
                    onPointerDown={() => setSelectedFurnitureId(null)}
                  >
                    {selectedRoom.furniture.map((item) => (
                      <FurnitureItem
                        key={item.id}
                        item={item}
                        scale={decorateScale}
                        selected={item.id === selectedFurnitureId}
                        onPointerDown={(e) => handleFurniturePointerDown(e, selectedRoom, item)}
                        onRotate={() => rotateFurniture(selectedRoom.id, item.id)}
                        onDelete={() => deleteFurniture(selectedRoom.id, item.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="hb-empty-state">
                    <DoorOpen size={32} />
                    <div>No rooms yet — switch to Build to lay out your floor plan first.</div>
                  </div>
                )}
              </div>
              <div className="hb-hint">Click a furniture item to rotate or remove it. Drag items to arrange the room.</div>
            </div>

            <div className="hb-properties">
              {selectedRoom ? (
                <>
                  <div className="hb-sidebar-title">Wall color</div>
                  <div className="hb-color-grid" style={{ marginBottom: 16 }}>
                    {WALL_COLORS.map((c) => (
                      <button key={c} className={`hb-color-swatch${selectedRoom.wall === c ? ' active' : ''}`} style={{ background: c }} onClick={() => updateRoom(selectedRoom.id, { wall: c })} />
                    ))}
                  </div>
                  <div className="hb-sidebar-title">Flooring</div>
                  <div className="hb-floor-grid" style={{ marginBottom: 16 }}>
                    {FLOOR_OPTIONS.map((f) => {
                      const locked = f.premium && plan === 'free';
                      return (
                        <button key={f.id} className={`hb-floor-swatch${selectedRoom.floor === f.id ? ' active' : ''}`} style={{ ...getFloorStyle(f.id), opacity: locked ? 0.55 : 1 }} onClick={() => pickFloor(selectedRoom, f)}>
                          <span className="hb-floor-swatch-label">{f.label}</span>
                          {locked && <span className="hb-lock-badge"><Lock size={10} /></span>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedFurniture ? (
                    <>
                      <div className="hb-sidebar-title">Selected item</div>
                      <div className="hb-summary-row"><span>{FURNITURE_TYPES.find((t) => t.id === selectedFurniture.typeId)?.name}</span><span>{selectedFurniture.rotation}°</span></div>
                      <button className="hb-delete-room-btn" style={{ marginTop: 10 }} onClick={() => deleteFurniture(selectedRoom.id, selectedFurniture.id)}><Trash2 size={13} /> Remove item</button>
                    </>
                  ) : (
                    <div className="hb-empty-hint">Select a furniture item in the room to rotate or remove it.</div>
                  )}
                </>
              ) : (
                <div className="hb-empty-hint">Pick a room above to decorate it.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ MARKETING PIECES =========================== */

function DemoPreview() {
  const mini = [
    { name: 'Living Room', wall: '#C1613D' },
    { name: 'Kitchen', wall: '#E8E2D4' },
    { name: 'Bedroom', wall: '#7C9070' },
    { name: 'Bathroom', wall: '#5B87A8' },
  ];
  return (
    <div className="ds-demo-sheet">
      <div className="ds-demo-grid">
        {mini.map((r) => (
          <div key={r.name} className="ds-demo-room" style={{ borderColor: r.wall }}>
            <span>{r.name}</span>
          </div>
        ))}
      </div>
      <div className="ds-demo-caption">Illustrative preview — the real thing is fully interactive.</div>
    </div>
  );
}

function UpgradeModal({ tier, billing, onClose, onConfirm }) {
  const plan = PRICING_PLANS.find((p) => p.id === tier);
  if (!plan) return null;
  const price = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const period = billing === 'yearly' ? '/yr' : '/mo';
  return (
    <div className="ds-modal-overlay" onPointerDown={onClose}>
      <div className="ds-modal" onPointerDown={(e) => e.stopPropagation()}>
        <button className="ds-modal-close" onClick={onClose}><X size={16} /></button>
        <div className="ds-modal-eyebrow">Upgrade to</div>
        <div className="ds-modal-title">{plan.name}</div>
        <div className="ds-modal-price">${price}<span>{period}</span></div>
        <ul className="ds-modal-features">
          {plan.features.map((f) => (
            <li key={f}><Check size={14} /> {f}</li>
          ))}
        </ul>
        <button className="ds-btn ds-btn-primary ds-btn-full" onClick={() => onConfirm(tier)}>Confirm upgrade</button>
        <div className="ds-modal-note">Demo checkout — no card required and nothing is charged. Wire this button to Stripe or Paddle to accept real payments.</div>
      </div>
    </div>
  );
}

function MarketingSite({ plan, billing, setBilling, onLaunch, onUpgrade, mobileNavOpen, setMobileNavOpen, openFaq, setOpenFaq }) {
  function scrollTo(id) {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div>
      {/* -------- nav -------- */}
      <nav className="ds-nav">
        <div className="ds-nav-inner">
          <div className="ds-logo">Drafting Table</div>
          <div className="ds-nav-links">
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
          </div>
          <div className="ds-nav-actions">
            <span className={`hb-plan-badge hb-plan-${plan}`}>{plan === 'pro' ? 'Pro' : plan === 'studio' ? 'Studio' : 'Free'}</span>
            <button className="ds-btn ds-btn-primary" onClick={onLaunch}>Launch app <ArrowRight size={14} /></button>
          </div>
          <button className="ds-mobile-toggle" onClick={() => setMobileNavOpen((v) => !v)}>
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="ds-mobile-menu">
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
            <button className="ds-btn ds-btn-primary" onClick={onLaunch}>Launch app</button>
          </div>
        )}
      </nav>

      {/* -------- hero -------- */}
      <section className="ds-band ds-band-dark">
        <div className="ds-container ds-hero">
          <div className="ds-hero-eyebrow">FLOOR PLANS · MATERIALS · FURNITURE</div>
          <h1 className="ds-hero-title">Design your home<br />before you build it.</h1>
          <p className="ds-hero-sub">Lay out every room, choose wall colors and flooring, then furnish the space — right in your browser, free to start.</p>
          <div className="ds-hero-ctas">
            <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={onLaunch}>Launch the app free <ArrowRight size={16} /></button>
            <button className="ds-btn ds-btn-ghost ds-btn-lg" onClick={() => scrollTo('how')}>See how it works</button>
          </div>
        </div>
      </section>

      {/* -------- trust strip -------- */}
      <section className="ds-band ds-band-dark ds-trust-strip">
        <div className="ds-container ds-trust-row">
          <div className="ds-trust-item"><Save size={16} /> Autosaves as you go</div>
          <div className="ds-trust-item"><Smartphone size={16} /> Works on any device</div>
          <div className="ds-trust-item"><Check size={16} /> Free plan, no card needed</div>
          <div className="ds-trust-item"><Sparkles size={16} /> Nothing to install</div>
        </div>
      </section>

      {/* -------- features -------- */}
      <section className="ds-band ds-band-paper" id="features">
        <div className="ds-container">
          <div className="ds-section-eyebrow">FEATURES</div>
          <h2 className="ds-section-heading">Everything you need to plan a room, or a whole house.</h2>
          <div className="ds-features-grid">
            {FEATURE_CARDS.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="ds-feature-card">
                  <div className="ds-feature-icon"><Icon size={20} /></div>
                  <div className="ds-feature-title">{f.title}</div>
                  <div className="ds-feature-desc">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------- how it works -------- */}
      <section className="ds-band ds-band-dark" id="how">
        <div className="ds-container">
          <div className="ds-section-eyebrow">HOW IT WORKS</div>
          <h2 className="ds-section-heading light">Three steps from empty lot to furnished home.</h2>
          <div className="ds-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="ds-step">
                <div className="ds-step-num">{s.n}</div>
                <div className="ds-step-title">{s.title}</div>
                <div className="ds-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------- demo -------- */}
      <section className="ds-band ds-band-blueprint">
        <div className="ds-container ds-demo-wrap">
          <div>
            <div className="ds-section-eyebrow light">SEE IT FIRST</div>
            <h2 className="ds-section-heading light">See it before you build it.</h2>
            <p className="ds-demo-copy">A quick peek at what the floor plan looks like once a few rooms are placed. The real version is fully interactive — drag, resize, and furnish every room yourself.</p>
            <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={onLaunch}>Launch the full app <ArrowRight size={16} /></button>
          </div>
          <DemoPreview />
        </div>
      </section>

      {/* -------- pricing -------- */}
      <section className="ds-band ds-band-paper" id="pricing">
        <div className="ds-container">
          <div className="ds-section-eyebrow">PRICING</div>
          <h2 className="ds-section-heading">Start free. Upgrade when you outgrow it.</h2>
          <div className="ds-billing-toggle">
            <button className={billing === 'monthly' ? 'active' : ''} onClick={() => setBilling('monthly')}>Monthly</button>
            <button className={billing === 'yearly' ? 'active' : ''} onClick={() => setBilling('yearly')}>Yearly <span>2 months free</span></button>
          </div>
          <div className="ds-pricing-grid">
            {PRICING_PLANS.map((p) => {
              const price = billing === 'yearly' ? p.priceYearly : p.priceMonthly;
              const period = p.priceMonthly === 0 ? '' : billing === 'yearly' ? '/yr' : '/mo';
              return (
                <div key={p.id} className={`ds-pricing-card${p.highlight ? ' highlight' : ''}`}>
                  {p.highlight && <div className="ds-pricing-badge"><Star size={12} /> Most popular</div>}
                  <div className="ds-pricing-name">{p.name}</div>
                  <div className="ds-pricing-tagline">{p.tagline}</div>
                  <div className="ds-price">${price}<span>{period}</span></div>
                  <ul className="ds-plan-features">
                    {p.features.map((f) => <li key={f}><Check size={14} /> {f}</li>)}
                  </ul>
                  <button
                    className={`ds-btn ${p.highlight ? 'ds-btn-primary' : 'ds-btn-secondary'} ds-btn-full`}
                    onClick={() => (p.id === 'free' ? onLaunch() : onUpgrade(p.id))}
                  >
                    {p.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------- testimonials -------- */}
      <section className="ds-band ds-band-dark">
        <div className="ds-container">
          <div className="ds-section-eyebrow light">WHAT PEOPLE ARE SAYING</div>
          <div className="ds-sample-note">Sample quotes for this template — swap in real customer testimonials before launch.</div>
          <div className="ds-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="ds-testimonial-card">
                <div className="ds-testimonial-stars"><Star size={13} /><Star size={13} /><Star size={13} /><Star size={13} /><Star size={13} /></div>
                <div className="ds-testimonial-quote">"{t.quote}"</div>
                <div className="ds-testimonial-name">{t.name} <span>· {t.role}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------- faq -------- */}
      <section className="ds-band ds-band-paper" id="faq">
        <div className="ds-container">
          <div className="ds-section-eyebrow">FAQ</div>
          <h2 className="ds-section-heading">Questions, answered.</h2>
          <div className="ds-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className="ds-faq-item">
                <button className="ds-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {item.q}
                  {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openFaq === i && <div className="ds-faq-answer">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------- final cta -------- */}
      <section className="ds-band ds-band-brass">
        <div className="ds-container ds-final-cta">
          <h2>Your next place starts with a plan.</h2>
          <button className="ds-btn ds-btn-dark ds-btn-lg" onClick={onLaunch}>Launch the app free <ArrowRight size={16} /></button>
        </div>
      </section>

      {/* -------- footer -------- */}
      <footer className="ds-band ds-band-footer">
        <div className="ds-container ds-footer-grid">
          <div>
            <div className="ds-logo light">Drafting Table</div>
            <p className="ds-footer-tagline">Design the plan, then make it home.</p>
          </div>
          <div className="ds-footer-col">
            <div className="ds-footer-col-title">Product</div>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('pricing')}>Pricing</button>
            <button onClick={onLaunch}>Launch app</button>
          </div>
          <div className="ds-footer-col">
            <div className="ds-footer-col-title">Legal</div>
            <span>Privacy Policy (add before launch)</span>
            <span>Terms of Service (add before launch)</span>
          </div>
        </div>
        <div className="ds-container ds-footer-bottom">© {new Date().getFullYear()} Drafting Table. Demo product — not affiliated with any real business.</div>
      </footer>
    </div>
  );
}

/* ================================= APP =================================== */

export default function App() {
  const [view, setView] = useState('marketing');
  const [plan, setPlan] = useState('free');
  const [hydrated, setHydrated] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(PLAN_STORAGE_KEY, false);
        if (!cancelled && res && res.value && ['free', 'pro', 'studio'].includes(res.value)) {
          setPlan(res.value);
        }
      } catch (e) {
        /* no saved plan yet */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      try { await window.storage.set(PLAN_STORAGE_KEY, plan, false); } catch (e) { /* ignore */ }
    })();
  }, [plan, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function requireUpgrade(tier) { setUpgradeModal(tier); }
  function confirmUpgrade(tier) {
    setPlan(tier);
    setUpgradeModal(null);
    setToast(`You're on ${tier === 'pro' ? 'Pro' : 'Studio'} now — demo upgrade, no real charge.`);
  }
  function launch() { setView('app'); }
  function exitApp() { setView('marketing'); }

  return (
    <div className="ds-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .ds-root, .ds-root * { box-sizing: border-box; }
        .ds-root {
          --ink: #1E2A38;
          --paper: #F3EFE4;
          --mat: #232E27;
          --mat-dark: #14201A;
          --blueprint: #1B3A5C;
          --blueprint-line: #CFE3F0;
          --brass: #B8863B;
          --brass-light: #E8B85E;
          --sage: #7C9070;
          --clay: #BD5B3A;
          font-family: 'Inter', -apple-system, sans-serif;
          color: var(--ink);
          background: var(--mat);
          border-radius: 12px;
          overflow: hidden;
        }
        .ds-root button { font-family: inherit; cursor: pointer; }
        .ds-root input { font-family: inherit; }
        .ds-container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
        h1, h2 { margin: 0; }
        p { margin: 0; }
        ul { margin: 0; padding: 0; list-style: none; }

        /* buttons */
        .ds-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; border-radius: 8px; border: none; font-size: 13.5px; font-weight: 600; white-space: nowrap; }
        .ds-btn-primary { background: var(--brass); color: var(--ink); }
        .ds-btn-primary:hover { background: var(--brass-light); }
        .ds-btn-secondary { background: transparent; color: var(--ink); border: 1.5px solid #D8CFB8; }
        .ds-btn-secondary:hover { border-color: var(--brass); }
        .ds-btn-ghost { background: transparent; color: #F3EFE4; border: 1.5px solid rgba(243,239,228,0.35); }
        .ds-btn-ghost:hover { border-color: var(--brass-light); color: var(--brass-light); }
        .ds-btn-dark { background: var(--ink); color: #F3EFE4; }
        .ds-btn-dark:hover { background: #14202E; }
        .ds-btn-lg { padding: 13px 22px; font-size: 14.5px; }
        .ds-btn-full { width: 100%; }

        /* nav */
        .ds-nav { position: sticky; top: 0; z-index: 20; background: rgba(35,46,39,0.92); backdrop-filter: blur(6px); border-bottom: 1px solid #3C4A40; }
        .ds-nav-inner { max-width: 1080px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; gap: 24px; }
        .ds-logo { font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px; color: #F3EFE4; }
        .ds-logo.light { color: #F3EFE4; margin-bottom: 6px; }
        .ds-nav-links { display: flex; gap: 4px; flex: 1; }
        .ds-nav-links button { background: none; border: none; color: #C9D2CB; font-size: 13.5px; font-weight: 500; padding: 8px 12px; border-radius: 6px; }
        .ds-nav-links button:hover { color: #F3EFE4; background: rgba(255,255,255,0.06); }
        .ds-nav-actions { display: flex; align-items: center; gap: 10px; }
        .ds-mobile-toggle { display: none; background: none; border: none; color: #F3EFE4; }
        .ds-mobile-menu { display: flex; flex-direction: column; gap: 4px; padding: 10px 24px 16px; }
        .ds-mobile-menu button { text-align: left; background: none; border: none; color: #E5E1D4; font-size: 14px; padding: 10px 4px; border-bottom: 1px solid #3C4A40; }
        .ds-mobile-menu .ds-btn { margin-top: 8px; justify-content: center; }

        /* bands */
        .ds-band { padding: 64px 0; }
        .ds-band-dark { background: var(--mat); color: #F3EFE4; }
        .ds-band-paper { background: var(--paper); color: var(--ink); }
        .ds-band-blueprint { background: var(--blueprint); color: #EAF4FB; }
        .ds-band-brass { background: linear-gradient(135deg, var(--brass), var(--brass-light)); color: var(--ink); padding: 52px 0; }
        .ds-band-footer { background: var(--mat-dark); color: #9CAA9F; padding: 40px 0 24px; }

        /* hero */
        .ds-hero { text-align: center; padding: 40px 24px 16px; }
        .ds-hero-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 1.6px; color: var(--brass-light); margin-bottom: 16px; }
        .ds-hero-title { font-family: 'Fraunces', serif; font-weight: 700; font-size: 46px; line-height: 1.12; color: #F9F6EE; max-width: 700px; margin: 0 auto; }
        .ds-hero-sub { font-size: 16px; color: #C9D2CB; max-width: 540px; margin: 20px auto 0; line-height: 1.6; }
        .ds-hero-ctas { display: flex; gap: 12px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }

        /* trust strip */
        .ds-trust-strip { padding: 26px 0; border-top: 1px solid #3C4A40; border-bottom: 1px solid #3C4A40; }
        .ds-trust-row { display: flex; justify-content: center; gap: 34px; flex-wrap: wrap; }
        .ds-trust-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #A9B6AC; font-weight: 500; }
        .ds-trust-item svg { color: var(--brass-light); }

        /* section heading */
        .ds-section-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 1.6px; color: var(--brass); margin-bottom: 10px; font-weight: 600; }
        .ds-section-eyebrow.light { color: var(--brass-light); }
        .ds-section-heading { font-family: 'Fraunces', serif; font-weight: 600; font-size: 30px; max-width: 560px; line-height: 1.25; margin-bottom: 36px; }
        .ds-section-heading.light { color: #F9F6EE; }

        /* features */
        .ds-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ds-feature-card { background: #FCFAF3; border: 1px solid #E2DBC9; border-radius: 12px; padding: 22px; }
        .ds-feature-icon { width: 38px; height: 38px; border-radius: 9px; background: var(--blueprint); color: #EAF4FB; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .ds-feature-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 16.5px; margin-bottom: 6px; }
        .ds-feature-desc { font-size: 13px; color: #6B6355; line-height: 1.55; }

        /* steps */
        .ds-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .ds-step-num { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 600; color: var(--brass-light); margin-bottom: 10px; }
        .ds-step-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #F9F6EE; }
        .ds-step-desc { font-size: 13.5px; color: #A9B6AC; line-height: 1.6; }

        /* demo */
        .ds-demo-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .ds-demo-copy { font-size: 14.5px; color: #D6E4EE; line-height: 1.65; margin: 16px 0 26px; max-width: 420px; }
        .ds-demo-sheet { background: rgba(255,255,255,0.06); border: 1.5px solid rgba(207,227,240,0.35); border-radius: 12px; padding: 18px; }
        .ds-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ds-demo-room { border: 2px solid; border-radius: 6px; background: rgba(255,255,255,0.04); padding: 26px 10px; text-align: center; font-size: 12px; font-weight: 600; color: #EAF4FB; }
        .ds-demo-caption { margin-top: 12px; font-size: 11px; color: #9FB6C9; text-align: center; font-style: italic; }

        /* pricing */
        .ds-billing-toggle { display: inline-flex; background: #FCFAF3; border: 1px solid #D8CFB8; border-radius: 8px; padding: 4px; margin-bottom: 30px; gap: 4px; }
        .ds-billing-toggle button { background: none; border: none; padding: 7px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; color: #6B6355; display: flex; align-items: center; gap: 6px; }
        .ds-billing-toggle button.active { background: var(--brass); color: var(--ink); }
        .ds-billing-toggle button span { font-size: 10px; background: rgba(255,255,255,0.35); padding: 1px 5px; border-radius: 4px; }
        .ds-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ds-pricing-card { position: relative; background: #FCFAF3; border: 1.5px solid #E2DBC9; border-radius: 14px; padding: 26px 22px; display: flex; flex-direction: column; }
        .ds-pricing-card.highlight { border-color: var(--brass); box-shadow: 0 10px 28px rgba(184,134,59,0.18); transform: translateY(-6px); }
        .ds-pricing-badge { position: absolute; top: -13px; left: 22px; background: var(--brass); color: var(--ink); font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 999px; display: flex; align-items: center; gap: 4px; }
        .ds-pricing-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 19px; }
        .ds-pricing-tagline { font-size: 12.5px; color: #7A6F5E; margin-top: 3px; }
        .ds-price { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 600; margin: 18px 0; }
        .ds-price span { font-size: 13px; color: #7A6F5E; font-weight: 500; }
        .ds-plan-features { flex: 1; margin-bottom: 20px; }
        .ds-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; padding: 6px 0; color: #423C31; }
        .ds-plan-features li svg { color: var(--sage); flex-shrink: 0; margin-top: 2px; }

        /* testimonials */
        .ds-sample-note { font-size: 11.5px; color: #8FA091; font-style: italic; margin-bottom: 30px; }
        .ds-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ds-testimonial-card { background: rgba(255,255,255,0.05); border: 1px solid #3C4A40; border-radius: 12px; padding: 20px; }
        .ds-testimonial-stars { display: flex; gap: 2px; color: var(--brass-light); margin-bottom: 10px; }
        .ds-testimonial-quote { font-size: 13.5px; line-height: 1.6; color: #E5E1D4; margin-bottom: 14px; font-style: italic; }
        .ds-testimonial-name { font-size: 12.5px; font-weight: 600; color: #F3EFE4; }
        .ds-testimonial-name span { font-weight: 400; color: #8FA091; }

        /* faq */
        .ds-faq-list { max-width: 680px; }
        .ds-faq-item { border-bottom: 1px solid #E2DBC9; }
        .ds-faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; padding: 16px 4px; font-size: 14.5px; font-weight: 600; color: var(--ink); text-align: left; }
        .ds-faq-answer { padding: 0 4px 16px; font-size: 13.5px; color: #6B6355; line-height: 1.6; max-width: 560px; }

        /* final cta */
        .ds-final-cta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px; }
        .ds-final-cta h2 { font-family: 'Fraunces', serif; font-weight: 700; font-size: 26px; }

        /* footer */
        .ds-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 30px; padding-bottom: 28px; }
        .ds-footer-tagline { font-size: 12.5px; margin-top: 6px; color: #7C8A80; }
        .ds-footer-col-title { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color: #5E6D63; font-weight: 700; margin-bottom: 10px; }
        .ds-footer-col button, .ds-footer-col span { display: block; background: none; border: none; text-align: left; color: #9CAA9F; font-size: 12.5px; padding: 5px 0; }
        .ds-footer-col button:hover { color: #F3EFE4; }
        .ds-footer-bottom { border-top: 1px solid #2A362F; padding-top: 18px; font-size: 11px; color: #5E6D63; }

        /* upgrade modal */
        .ds-modal-overlay { position: fixed; inset: 0; background: rgba(20,32,26,0.72); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .ds-modal { position: relative; background: #FCFAF3; color: var(--ink); border-radius: 14px; padding: 28px; max-width: 340px; width: 100%; }
        .ds-modal-close { position: absolute; top: 14px; right: 14px; background: none; border: none; color: #7A6F5E; }
        .ds-modal-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 1px; color: var(--brass); font-weight: 700; }
        .ds-modal-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 22px; margin-top: 4px; }
        .ds-modal-price { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 600; margin: 12px 0 16px; }
        .ds-modal-price span { font-size: 12px; color: #7A6F5E; }
        .ds-modal-features { margin-bottom: 18px; }
        .ds-modal-features li { display: flex; gap: 8px; font-size: 12.5px; padding: 4px 0; color: #423C31; align-items: flex-start; }
        .ds-modal-features li svg { color: var(--sage); margin-top: 2px; flex-shrink: 0; }
        .ds-modal-note { font-size: 10.5px; color: #8A8069; margin-top: 12px; line-height: 1.5; font-style: italic; }

        /* toast */
        .ds-toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: var(--ink); color: #F3EFE4; padding: 12px 20px; border-radius: 8px; font-size: 13px; z-index: 60; box-shadow: 0 10px 26px rgba(0,0,0,0.3); }

        @media (max-width: 900px) {
          .ds-nav-links, .ds-nav-actions .ds-btn { display: none; }
          .ds-mobile-toggle { display: block; }
          .ds-hero-title { font-size: 34px; }
          .ds-features-grid, .ds-steps, .ds-pricing-grid, .ds-testimonials-grid { grid-template-columns: 1fr; }
          .ds-demo-wrap { grid-template-columns: 1fr; }
          .ds-footer-grid { grid-template-columns: 1fr; }
          .ds-pricing-card.highlight { transform: none; }
          .ds-final-cta { flex-direction: column; text-align: center; }
        }

        /* ---- embedded app chrome (reused from the product) ---- */
        .hb-app { font-family: 'Inter', -apple-system, sans-serif; background: #232E27; color: #EDEAE0; padding: 20px; min-height: 640px; position: relative; }
        .hb-watermark { position: absolute; bottom: 10px; left: 20px; background: rgba(0,0,0,0.3); color: #E5E1D4; font-size: 10.5px; padding: 4px 9px; border-radius: 6px; z-index: 5; font-family: 'JetBrains Mono', monospace; }
        .hb-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; border: 1.5px solid #4A5A4F; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; background: linear-gradient(180deg, #29352D, #232E27); }
        .hb-title-wrap { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .hb-back-link { display: flex; align-items: center; gap: 3px; background: none; border: none; color: #A9B6AC; font-size: 12px; font-weight: 600; padding: 4px 6px; border-radius: 6px; }
        .hb-back-link:hover { color: #F3EFE4; background: rgba(255,255,255,0.06); }
        .hb-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 22px; color: #F3EFE4; }
        .hb-subtitle { font-size: 12px; color: #A9B6AC; font-style: italic; font-family: 'Fraunces', serif; }
        .hb-tabs { display: flex; gap: 6px; background: #1B241F; padding: 4px; border-radius: 8px; border: 1px solid #3C4A40; }
        .hb-tab { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 6px; border: none; background: transparent; color: #A9B6AC; font-size: 13px; font-weight: 600; }
        .hb-tab.active { background: #B8863B; color: #1E2A38; }
        .hb-stats-block { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .hb-stat { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #A9B6AC; text-align: right; }
        .hb-stat b { display: block; font-size: 14px; color: #F3EFE4; font-weight: 600; }
        .hb-save-status { display: flex; align-items: center; gap: 5px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #7C9070; }
        .hb-save-status.error { color: #C1613D; }
        .hb-spin { animation: hb-spin 0.9s linear infinite; }
        @keyframes hb-spin { to { transform: rotate(360deg); } }
        .hb-plan-badge { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; font-weight: 700; padding: 4px 9px; border-radius: 999px; }
        .hb-plan-free { background: #3C4A40; color: #C9D2CB; }
        .hb-plan-pro { background: #B8863B; color: #1E2A38; }
        .hb-plan-studio { background: #2B4C7E; color: #EAF4FB; }
        .hb-upgrade-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 6px; border: none; background: #E8B85E; color: #1E2A38; font-size: 12px; font-weight: 700; }
        .hb-reset-btn { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 6px; border: 1px solid #5A4038; background: transparent; color: #D98466; font-size: 12px; font-weight: 600; }
        .hb-reset-btn.armed { background: #BD5B3A; color: #1E2A38; border-color: #BD5B3A; }

        .hb-body { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
        .hb-sidebar { width: 210px; flex-shrink: 0; background: #F3EFE4; color: #1E2A38; border-radius: 10px; padding: 14px; max-height: 640px; overflow-y: auto; }
        .hb-sidebar-title { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 1px; text-transform: uppercase; color: #7A6F5E; margin-bottom: 10px; font-weight: 600; }
        .hb-plan-note { font-size: 11px; color: #7A6F5E; margin-bottom: 10px; line-height: 1.5; }
        .hb-upgrade-link { background: none; border: none; color: #B8863B; font-weight: 700; font-size: 11px; padding: 0; margin-left: 4px; text-decoration: underline; }
        .hb-palette-btn { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 9px; margin-bottom: 6px; border-radius: 7px; border: 1px solid #E2DBC9; background: #FCFAF3; color: #1E2A38; font-size: 12.5px; font-weight: 500; text-align: left; }
        .hb-palette-btn:hover:not(:disabled) { border-color: #B8863B; background: #FBF3E2; }
        .hb-palette-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .hb-swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.15); }
        .hb-palette-btn span.name { flex: 1; }
        .hb-furn-cat-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #9C8F76; margin: 12px 0 6px; font-weight: 700; }
        .hb-furn-cat-title:first-child { margin-top: 0; }

        .hb-canvas-area { flex: 1; min-width: 320px; }
        .hb-canvas-wrap { overflow-x: auto; border-radius: 10px; border: 3px solid #14202E; }
        .hb-blueprint-canvas { position: relative; width: ${CANVAS_PX_W}px; height: ${CANVAS_PX_H}px; background-color: #1B3A5C;
          background-image:
            repeating-linear-gradient(0deg, rgba(207,227,240,0.18) 0px, rgba(207,227,240,0.18) 1px, transparent 1px, transparent ${PLAN_SCALE}px),
            repeating-linear-gradient(90deg, rgba(207,227,240,0.18) 0px, rgba(207,227,240,0.18) 1px, transparent 1px, transparent ${PLAN_SCALE}px),
            repeating-linear-gradient(0deg, rgba(207,227,240,0.4) 0px, rgba(207,227,240,0.4) 1.5px, transparent 1.5px, transparent ${PLAN_SCALE * 5}px),
            repeating-linear-gradient(90deg, rgba(207,227,240,0.4) 0px, rgba(207,227,240,0.4) 1.5px, transparent 1.5px, transparent ${PLAN_SCALE * 5}px);
        }
        .hb-room { position: absolute; background: rgba(255,255,255,0.04); border: 2px solid #CFE3F0; display: flex; align-items: center; justify-content: center; color: #EAF4FB; user-select: none; touch-action: none; }
        .hb-room.selected { border-color: #E8B85E; border-width: 2.5px; background: rgba(232,184,94,0.08); }
        .hb-room-label { text-align: center; padding: 4px; pointer-events: none; }
        .hb-room-name { font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; line-height: 1.15; }
        .hb-room-dim { font-family: 'JetBrains Mono', monospace; font-size: 10px; opacity: 0.85; margin-top: 2px; }
        .hb-room-sqft { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; opacity: 0.65; }
        .hb-room-delete { position: absolute; top: -9px; right: -9px; width: 18px; height: 18px; border-radius: 50%; background: #BD5B3A; border: 1.5px solid #F3EFE4; color: #F3EFE4; display: flex; align-items: center; justify-content: center; padding: 0; }
        .hb-resize-handle { position: absolute; right: -6px; bottom: -6px; width: 14px; height: 14px; border-radius: 3px; background: #E8B85E; border: 1.5px solid #1B3A5C; cursor: nwse-resize; touch-action: none; }
        .hb-hint { font-size: 11.5px; color: #8FA091; margin-top: 10px; font-style: italic; }

        .hb-properties { width: 220px; flex-shrink: 0; background: #F3EFE4; color: #1E2A38; border-radius: 10px; padding: 16px; }
        .hb-empty-hint { font-size: 12.5px; color: #7A6F5E; line-height: 1.5; }
        .hb-field { margin-bottom: 12px; }
        .hb-field label { display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #7A6F5E; font-weight: 700; margin-bottom: 5px; }
        .hb-input { width: 100%; padding: 7px 9px; border-radius: 6px; border: 1px solid #D8CFB8; background: #FCFAF3; color: #1E2A38; font-size: 13px; }
        .hb-input:focus { outline: none; border-color: #B8863B; }
        .hb-dims-row { display: flex; gap: 8px; }
        .hb-door-row { display: flex; gap: 6px; }
        .hb-door-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0; border-radius: 6px; border: 1px solid #D8CFB8; background: #FCFAF3; color: #6B6355; font-size: 9.5px; font-weight: 700; }
        .hb-door-btn.active { background: #1B3A5C; border-color: #1B3A5C; color: #EAF4FB; }
        .hb-delete-room-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 0; margin-top: 6px; border-radius: 7px; border: none; background: #BD5B3A; color: #FBF3E2; font-size: 12.5px; font-weight: 700; }
        .hb-summary-row { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #6B6355; padding: 3px 0; border-bottom: 1px dashed #E2DBC9; }

        .hb-room-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .hb-room-chip { display: flex; align-items: center; gap: 7px; padding: 7px 12px; border-radius: 999px; border: 1.5px solid #4A5A4F; background: #1B241F; color: #D7DED9; font-size: 12.5px; font-weight: 600; }
        .hb-room-chip.active { border-color: #B8863B; background: #B8863B; color: #1E2A38; }
        .hb-chip-dot { width: 9px; height: 9px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.2); }
        .hb-decorate-stage { display: flex; justify-content: center; padding: 20px; background: #1B241F; border-radius: 10px; border: 3px solid #14201A; min-height: 420px; align-items: center; }
        .hb-decorate-room { position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.35); overflow: hidden; }
        .hb-furn-item { position: absolute; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #FBF3E2; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1.5px solid rgba(0,0,0,0.15); touch-action: none; gap: 2px; padding: 2px; }
        .hb-furn-item.selected { outline: 2.5px solid #E8B85E; outline-offset: 1px; }
        .hb-furn-label { font-size: 9.5px; font-weight: 700; text-align: center; line-height: 1.05; }
        .hb-furn-controls { position: absolute; top: -14px; right: -6px; display: flex; gap: 3px; }
        .hb-furn-controls button { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid #F3EFE4; background: #1E2A38; color: #F3EFE4; display: flex; align-items: center; justify-content: center; padding: 0; }
        .hb-color-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
        .hb-color-swatch { width: 100%; aspect-ratio: 1; border-radius: 6px; border: 1.5px solid rgba(0,0,0,0.15); padding: 0; }
        .hb-color-swatch.active { outline: 2px solid #B8863B; outline-offset: 2px; }
        .hb-floor-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
        .hb-floor-swatch { border-radius: 6px; border: 1.5px solid #D8CFB8; height: 34px; padding: 0; position: relative; overflow: hidden; }
        .hb-floor-swatch.active { border-color: #B8863B; border-width: 2px; }
        .hb-floor-swatch-label { position: absolute; bottom: 0; left: 0; right: 0; font-size: 8.5px; text-align: center; padding: 1px 0; background: rgba(30,42,56,0.72); color: #F3EFE4; font-weight: 600; }
        .hb-lock-badge { position: absolute; top: 2px; right: 2px; background: rgba(30,42,56,0.85); color: #F3EFE4; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
        .hb-empty-state { text-align: center; color: #8FA091; padding: 40px 20px; }
        .hb-empty-state svg { margin-bottom: 10px; opacity: 0.6; }

        @media (max-width: 1020px) {
          .hb-body { flex-direction: column; }
          .hb-sidebar, .hb-properties { width: 100%; max-height: none; }
        }
      `}</style>

      {toast && <div className="ds-toast">{toast}</div>}
      {upgradeModal && <UpgradeModal tier={upgradeModal} billing={billing} onClose={() => setUpgradeModal(null)} onConfirm={confirmUpgrade} />}

      {view === 'marketing' ? (
        <MarketingSite
          plan={plan}
          billing={billing}
          setBilling={setBilling}
          onLaunch={launch}
          onUpgrade={requireUpgrade}
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
          openFaq={openFaq}
          setOpenFaq={setOpenFaq}
        />
      ) : (
        <HouseBuilderApp plan={plan} onRequireUpgrade={requireUpgrade} onExit={exitApp} />
      )}
    </div>
  );
}