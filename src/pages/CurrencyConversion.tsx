import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  RefreshCw, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  GripVertical,
  History,
  Trash2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Asset {
  code: string;
  name: string;
  nameFr: string;
  symbol: string;
  decimals: number;
  type: 'fiat' | 'crypto';
  flag?: string;
}

interface ConversionHistoryItem {
  id: string;
  fromCode: string;
  toCode: string;
  fromAmount: number;
  toAmount: number;
  timestamp: number;
}

// Fiat currencies with flag emojis
const FIAT_CURRENCIES: Asset[] = [
  { code: 'USD', name: 'US Dollar', nameFr: 'Dollar américain', symbol: '$', decimals: 2, type: 'fiat', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', nameFr: 'Euro', symbol: '€', decimals: 2, type: 'fiat', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', nameFr: 'Livre sterling', symbol: '£', decimals: 2, type: 'fiat', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', nameFr: 'Yen japonais', symbol: '¥', decimals: 0, type: 'fiat', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', nameFr: 'Franc suisse', symbol: 'CHF', decimals: 2, type: 'fiat', flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', nameFr: 'Dollar canadien', symbol: 'CA$', decimals: 2, type: 'fiat', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', nameFr: 'Dollar australien', symbol: 'A$', decimals: 2, type: 'fiat', flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar', nameFr: 'Dollar néo-zélandais', symbol: 'NZ$', decimals: 2, type: 'fiat', flag: '🇳🇿' },
  { code: 'CNY', name: 'Chinese Yuan', nameFr: 'Yuan chinois', symbol: '¥', decimals: 2, type: 'fiat', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', nameFr: 'Dollar de Hong Kong', symbol: 'HK$', decimals: 2, type: 'fiat', flag: '🇭🇰' },
  { code: 'SGD', name: 'Singapore Dollar', nameFr: 'Dollar de Singapour', symbol: 'S$', decimals: 2, type: 'fiat', flag: '🇸🇬' },
  { code: 'XAF', name: 'CFA Franc (CEMAC)', nameFr: 'Franc CFA (CEMAC)', symbol: 'FCFA', decimals: 0, type: 'fiat', flag: '🌍' },
  { code: 'XOF', name: 'CFA Franc (UEMOA)', nameFr: 'Franc CFA (UEMOA)', symbol: 'FCFA', decimals: 0, type: 'fiat', flag: '🌍' },
  { code: 'ZAR', name: 'South African Rand', nameFr: 'Rand sud-africain', symbol: 'R', decimals: 2, type: 'fiat', flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira', nameFr: 'Naira nigérian', symbol: '₦', decimals: 2, type: 'fiat', flag: '🇳🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', nameFr: 'Cedi ghanéen', symbol: '₵', decimals: 2, type: 'fiat', flag: '🇬🇭' },
  { code: 'KES', name: 'Kenyan Shilling', nameFr: 'Shilling kényan', symbol: 'KSh', decimals: 2, type: 'fiat', flag: '🇰🇪' },
  { code: 'EGP', name: 'Egyptian Pound', nameFr: 'Livre égyptienne', symbol: 'E£', decimals: 2, type: 'fiat', flag: '🇪🇬' },
  { code: 'MAD', name: 'Moroccan Dirham', nameFr: 'Dirham marocain', symbol: 'MAD', decimals: 2, type: 'fiat', flag: '🇲🇦' },
  { code: 'AED', name: 'UAE Dirham', nameFr: 'Dirham des Émirats', symbol: 'AED', decimals: 2, type: 'fiat', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', nameFr: 'Riyal saoudien', symbol: 'SAR', decimals: 2, type: 'fiat', flag: '🇸🇦' },
  { code: 'INR', name: 'Indian Rupee', nameFr: 'Roupie indienne', symbol: '₹', decimals: 2, type: 'fiat', flag: '🇮🇳' },
  { code: 'KRW', name: 'South Korean Won', nameFr: 'Won sud-coréen', symbol: '₩', decimals: 0, type: 'fiat', flag: '🇰🇷' },
  { code: 'THB', name: 'Thai Baht', nameFr: 'Baht thaïlandais', symbol: '฿', decimals: 2, type: 'fiat', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', nameFr: 'Ringgit malaisien', symbol: 'RM', decimals: 2, type: 'fiat', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', nameFr: 'Roupie indonésienne', symbol: 'Rp', decimals: 0, type: 'fiat', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', nameFr: 'Peso philippin', symbol: '₱', decimals: 2, type: 'fiat', flag: '🇵🇭' },
  { code: 'VND', name: 'Vietnamese Dong', nameFr: 'Dong vietnamien', symbol: '₫', decimals: 0, type: 'fiat', flag: '🇻🇳' },
  { code: 'SEK', name: 'Swedish Krona', nameFr: 'Couronne suédoise', symbol: 'kr', decimals: 2, type: 'fiat', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', nameFr: 'Couronne norvégienne', symbol: 'kr', decimals: 2, type: 'fiat', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', nameFr: 'Couronne danoise', symbol: 'kr', decimals: 2, type: 'fiat', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty', nameFr: 'Zloty polonais', symbol: 'zł', decimals: 2, type: 'fiat', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', nameFr: 'Couronne tchèque', symbol: 'Kč', decimals: 2, type: 'fiat', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', nameFr: 'Forint hongrois', symbol: 'Ft', decimals: 0, type: 'fiat', flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu', nameFr: 'Leu roumain', symbol: 'lei', decimals: 2, type: 'fiat', flag: '🇷🇴' },
  { code: 'RUB', name: 'Russian Ruble', nameFr: 'Rouble russe', symbol: '₽', decimals: 2, type: 'fiat', flag: '🇷🇺' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', nameFr: 'Hryvnia ukrainienne', symbol: '₴', decimals: 2, type: 'fiat', flag: '🇺🇦' },
  { code: 'TRY', name: 'Turkish Lira', nameFr: 'Livre turque', symbol: '₺', decimals: 2, type: 'fiat', flag: '🇹🇷' },
  { code: 'MXN', name: 'Mexican Peso', nameFr: 'Peso mexicain', symbol: 'MX$', decimals: 2, type: 'fiat', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', nameFr: 'Réal brésilien', symbol: 'R$', decimals: 2, type: 'fiat', flag: '🇧🇷' },
  { code: 'ARS', name: 'Argentine Peso', nameFr: 'Peso argentin', symbol: 'AR$', decimals: 2, type: 'fiat', flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso', nameFr: 'Peso chilien', symbol: 'CL$', decimals: 0, type: 'fiat', flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso', nameFr: 'Peso colombien', symbol: 'CO$', decimals: 0, type: 'fiat', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', nameFr: 'Sol péruvien', symbol: 'S/', decimals: 2, type: 'fiat', flag: '🇵🇪' },
];

// Cryptocurrencies with icons
const CRYPTOCURRENCIES: Asset[] = [
  { code: 'BTC', name: 'Bitcoin', nameFr: 'Bitcoin', symbol: '₿', decimals: 8, type: 'crypto', flag: '🪙' },
  { code: 'ETH', name: 'Ethereum', nameFr: 'Ethereum', symbol: 'Ξ', decimals: 8, type: 'crypto', flag: '💎' },
  { code: 'USDT', name: 'Tether', nameFr: 'Tether', symbol: '₮', decimals: 6, type: 'crypto', flag: '💵' },
  { code: 'USDC', name: 'USD Coin', nameFr: 'USD Coin', symbol: '$', decimals: 6, type: 'crypto', flag: '💰' },
  { code: 'BNB', name: 'Binance Coin', nameFr: 'Binance Coin', symbol: 'BNB', decimals: 8, type: 'crypto', flag: '🔶' },
  { code: 'SOL', name: 'Solana', nameFr: 'Solana', symbol: 'SOL', decimals: 9, type: 'crypto', flag: '☀️' },
  { code: 'XRP', name: 'Ripple', nameFr: 'Ripple', symbol: 'XRP', decimals: 6, type: 'crypto', flag: '💧' },
  { code: 'ADA', name: 'Cardano', nameFr: 'Cardano', symbol: 'ADA', decimals: 6, type: 'crypto', flag: '🔷' },
  { code: 'DOGE', name: 'Dogecoin', nameFr: 'Dogecoin', symbol: 'Ð', decimals: 8, type: 'crypto', flag: '🐕' },
  { code: 'TRX', name: 'Tron', nameFr: 'Tron', symbol: 'TRX', decimals: 6, type: 'crypto', flag: '⚡' },
  { code: 'MATIC', name: 'Polygon', nameFr: 'Polygon', symbol: 'MATIC', decimals: 8, type: 'crypto', flag: '🔮' },
  { code: 'LTC', name: 'Litecoin', nameFr: 'Litecoin', symbol: 'Ł', decimals: 8, type: 'crypto', flag: '🥈' },
  { code: 'DOT', name: 'Polkadot', nameFr: 'Polkadot', symbol: 'DOT', decimals: 10, type: 'crypto', flag: '⚪' },
  { code: 'AVAX', name: 'Avalanche', nameFr: 'Avalanche', symbol: 'AVAX', decimals: 9, type: 'crypto', flag: '🔺' },
  { code: 'LINK', name: 'Chainlink', nameFr: 'Chainlink', symbol: 'LINK', decimals: 8, type: 'crypto', flag: '🔗' },
  { code: 'SHIB', name: 'Shiba Inu', nameFr: 'Shiba Inu', symbol: 'SHIB', decimals: 8, type: 'crypto', flag: '🐶' },
  { code: 'TON', name: 'Toncoin', nameFr: 'Toncoin', symbol: 'TON', decimals: 9, type: 'crypto', flag: '💠' },
  { code: 'NEAR', name: 'Near Protocol', nameFr: 'Near Protocol', symbol: 'NEAR', decimals: 8, type: 'crypto', flag: '🌐' },
];

const ALL_ASSETS: Asset[] = [...FIAT_CURRENCIES, ...CRYPTOCURRENCIES];

const CACHE_KEY = 'crypto-fiat-rates-cache-v2';
const CACHE_DURATION = 5 * 60 * 1000;
const HISTORY_KEY = 'currency-conversion-history-v2';
const SLOTS_KEY = 'currency-conversion-slots';

interface ConversionSlot {
  id: number;
  assetCode: string;
  isEditing: boolean;
}

const CurrencyConversion: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [baseAmount, setBaseAmount] = useState<string>('100');
  const [slots, setSlots] = useState<ConversionSlot[]>(() => {
    const saved = localStorage.getItem(SLOTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      { id: 1, assetCode: 'USD', isEditing: true },
      { id: 2, assetCode: 'XAF', isEditing: false },
      { id: 3, assetCode: 'EUR', isEditing: false },
      { id: 4, assetCode: 'BTC', isEditing: false },
    ];
  });
  const [rates, setRates] = useState<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(1);
  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false);
  
  // Drag and drop state
  const [draggedSlotId, setDraggedSlotId] = useState<number | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<number | null>(null);

  // Save slots to localStorage
  useEffect(() => {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  }, [slots]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch rates
  const fetchRates = useCallback(async () => {
    setIsLoading(true);

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates: cachedRates, priceChanges: cachedChanges, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        
        if (cacheAge < CACHE_DURATION) {
          setRates(cachedRates);
          setPriceChanges(cachedChanges || {});
          setLastUpdated(new Date(timestamp));
          setIsLoading(false);
          return;
        }
      }

      let fiatRates: Record<string, number> = { USD: 1 };
      try {
        const fiatResponse = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        if (fiatResponse.ok) {
          const fiatData = await fiatResponse.json();
          if (fiatData?.usd) {
            FIAT_CURRENCIES.forEach(currency => {
              const code = currency.code.toLowerCase();
              if (code === 'usd') {
                fiatRates[currency.code] = 1;
              } else if (code === 'xaf' || code === 'xof') {
                const eurRate = fiatData.usd.eur || 0.92;
                fiatRates[currency.code] = eurRate * 655.957;
              } else if (fiatData.usd[code]) {
                fiatRates[currency.code] = fiatData.usd[code];
              }
            });
          }
        }
      } catch {
        console.log('Fiat API failed, using fallback');
      }

      let cryptoRates: Record<string, number> = {};
      let changes: Record<string, number> = {};
      
      try {
        const cryptoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin,binancecoin,solana,ripple,cardano,dogecoin,tron,matic-network,litecoin,polkadot,avalanche-2,chainlink,shiba-inu,the-open-network,near&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (cryptoResponse.ok) {
          const cryptoData = await cryptoResponse.json();
          
          const idToCode: Record<string, string> = {
            'bitcoin': 'BTC', 'ethereum': 'ETH', 'tether': 'USDT', 'usd-coin': 'USDC',
            'binancecoin': 'BNB', 'solana': 'SOL', 'ripple': 'XRP', 'cardano': 'ADA',
            'dogecoin': 'DOGE', 'tron': 'TRX', 'matic-network': 'MATIC', 'litecoin': 'LTC',
            'polkadot': 'DOT', 'avalanche-2': 'AVAX', 'chainlink': 'LINK',
            'shiba-inu': 'SHIB', 'the-open-network': 'TON', 'near': 'NEAR'
          };

          Object.entries(cryptoData).forEach(([id, data]: [string, any]) => {
            const code = idToCode[id];
            if (code && data.usd) {
              cryptoRates[code] = data.usd;
              if (data.usd_24h_change !== undefined) {
                changes[code] = data.usd_24h_change;
              }
            }
          });
        }
      } catch {
        console.log('Crypto API failed');
      }

      const allRates: Record<string, number> = { ...fiatRates };
      
      Object.entries(cryptoRates).forEach(([code, usdPrice]) => {
        allRates[code] = 1 / usdPrice;
      });

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        rates: allRates,
        priceChanges: changes,
        timestamp: Date.now(),
      }));

      setRates(allRates);
      setPriceChanges(changes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Rate fetch error:', err);
      
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates: cachedRates, priceChanges: cachedChanges, timestamp } = JSON.parse(cached);
        setRates(cachedRates);
        setPriceChanges(cachedChanges || {});
        setLastUpdated(new Date(timestamp));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Get asset data
  const getAsset = useCallback((code: string): Asset | undefined => {
    return ALL_ASSETS.find(a => a.code === code);
  }, []);

  // Get asset name based on language
  const getAssetName = useCallback((code: string): string => {
    const asset = getAsset(code);
    if (!asset) return code;
    return language === 'fr' ? asset.nameFr : asset.name;
  }, [getAsset, language]);

  // Convert amount
  const convertAmount = useCallback((amount: number, fromCode: string, toCode: string): number => {
    if (!rates[fromCode] || !rates[toCode]) return 0;
    
    let amountInUsd: number;
    amountInUsd = amount / rates[fromCode];
    
    let result: number;
    result = amountInUsd * rates[toCode];
    
    return result;
  }, [rates]);

  // Format number with proper decimals and spacing
  const formatNumber = useCallback((num: number, decimals: number = 4): string => {
    if (num === 0) return '0';
    
    const absNum = Math.abs(num);
    let formattedDecimals = decimals;
    
    if (absNum < 0.000001) formattedDecimals = 10;
    else if (absNum < 0.0001) formattedDecimals = 8;
    else if (absNum < 0.01) formattedDecimals = 6;
    else if (absNum < 1) formattedDecimals = 4;
    else if (absNum >= 1000000) formattedDecimals = 0;
    else if (absNum >= 1000) formattedDecimals = 2;
    
    const formatted = num.toFixed(Math.min(formattedDecimals, decimals));
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    if (parts[1]) {
      parts[1] = parts[1].replace(/0+$/, '');
      if (parts[1] === '') return parts[0];
    }
    
    return parts.join(',');
  }, []);

  // Update slot asset
  const updateSlotAsset = useCallback((slotId: number, newAssetCode: string) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, assetCode: newAssetCode } : slot
    ));
  }, []);

  // Get the base slot (the one being edited)
  const baseSlot = useMemo(() => {
    return slots.find(s => s.id === editingSlotId) || slots[0];
  }, [slots, editingSlotId]);

  // Calculate converted values
  const getConvertedValue = useCallback((slotId: number): number => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.id === editingSlotId) return parseFloat(baseAmount) || 0;
    
    const amount = parseFloat(baseAmount) || 0;
    return convertAmount(amount, baseSlot.assetCode, slot.assetCode);
  }, [slots, baseAmount, editingSlotId, baseSlot, convertAmount]);

  // Add to history
  const addToHistory = useCallback((fromCode: string, toCode: string, fromAmount: number, toAmount: number) => {
    const newItem: ConversionHistoryItem = {
      id: Date.now().toString(),
      fromCode,
      toCode,
      fromAmount,
      toAmount,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev.slice(0, 19)]); // Keep last 20
  }, []);

  // Handle slot click to edit
  const handleSlotClick = useCallback((slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    
    // Save current conversion to history
    if (baseSlot && editingSlotId) {
      const fromAmount = parseFloat(baseAmount) || 0;
      const toAmount = getConvertedValue(slotId);
      if (fromAmount > 0 && baseSlot.assetCode !== slot.assetCode) {
        addToHistory(baseSlot.assetCode, slot.assetCode, fromAmount, toAmount);
      }
    }
    
    // Calculate the new base amount based on current conversion
    const currentValue = getConvertedValue(slotId);
    setBaseAmount(currentValue.toString());
    setEditingSlotId(slotId);
  }, [slots, getConvertedValue, baseSlot, editingSlotId, baseAmount, addToHistory]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, slotId: number) => {
    setDraggedSlotId(slotId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, slotId: number) => {
    e.preventDefault();
    if (draggedSlotId !== slotId) {
      setDragOverSlotId(slotId);
    }
  }, [draggedSlotId]);

  const handleDragLeave = useCallback(() => {
    setDragOverSlotId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSlotId: number) => {
    e.preventDefault();
    
    if (draggedSlotId === null || draggedSlotId === targetSlotId) {
      setDraggedSlotId(null);
      setDragOverSlotId(null);
      return;
    }
    
    setSlots(prev => {
      const newSlots = [...prev];
      const draggedIndex = newSlots.findIndex(s => s.id === draggedSlotId);
      const targetIndex = newSlots.findIndex(s => s.id === targetSlotId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newSlots.splice(draggedIndex, 1);
        newSlots.splice(targetIndex, 0, draggedItem);
      }
      
      return newSlots;
    });
    
    setDraggedSlotId(null);
    setDragOverSlotId(null);
  }, [draggedSlotId]);

  const handleDragEnd = useCallback(() => {
    setDraggedSlotId(null);
    setDragOverSlotId(null);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Apply history item
  const applyHistoryItem = useCallback((item: ConversionHistoryItem) => {
    // Update first two slots with the conversion pair
    setSlots(prev => {
      const newSlots = [...prev];
      if (newSlots[0]) newSlots[0] = { ...newSlots[0], assetCode: item.fromCode };
      if (newSlots[1]) newSlots[1] = { ...newSlots[1], assetCode: item.toCode };
      return newSlots;
    });
    setBaseAmount(item.fromAmount.toString());
    setEditingSlotId(slots[0]?.id || 1);
    setShowHistory(false);
  }, [slots]);

  // Format relative time
  const formatRelativeTime = useCallback((timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return language === 'fr' ? "À l'instant" : 'Just now';
    if (minutes < 60) return language === 'fr' ? `Il y a ${minutes}min` : `${minutes}min ago`;
    if (hours < 24) return language === 'fr' ? `Il y a ${hours}h` : `${hours}h ago`;
    return language === 'fr' ? `Il y a ${days}j` : `${days}d ago`;
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <h1 className="text-lg font-semibold text-foreground">
            {language === 'fr' ? 'Convertisseur de devises' : 'Currency Converter'}
          </h1>
          
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-profit" />
            ) : (
              <WifiOff className="w-4 h-4 text-loss" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className={cn("text-foreground", showHistory && "bg-primary/10")}
            >
              <History className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchRates}
              disabled={isLoading}
              className="text-foreground"
            >
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="px-4 py-3 bg-secondary/30 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'fr' ? 'Historique récent' : 'Recent History'}
            </span>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-loss"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {language === 'fr' ? 'Effacer' : 'Clear'}
              </Button>
            )}
          </div>
          
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {language === 'fr' ? 'Aucune conversion récente' : 'No recent conversions'}
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.slice(0, 5).map((item) => {
                const fromAsset = getAsset(item.fromCode);
                const toAsset = getAsset(item.toCode);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => applyHistoryItem(item)}
                    className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span>{fromAsset?.flag}</span>
                      <span className="font-medium">{formatNumber(item.fromAmount, 2)} {item.fromCode}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <span>{toAsset?.flag}</span>
                      <span className="font-medium">{formatNumber(item.toAmount, 2)} {item.toCode}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Conversion List */}
      <div className="px-2 py-4">
        <div className="divide-y divide-border/50">
          {slots.map((slot, index) => {
            const asset = getAsset(slot.assetCode);
            const isEditing = slot.id === editingSlotId;
            const value = isEditing ? parseFloat(baseAmount) || 0 : getConvertedValue(slot.id);
            const priceChange = priceChanges[slot.assetCode];
            const isDragging = draggedSlotId === slot.id;
            const isDragOver = dragOverSlotId === slot.id;
            
            return (
              <div
                key={slot.id}
                draggable
                onDragStart={(e) => handleDragStart(e, slot.id)}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center justify-between py-5 px-3 cursor-pointer transition-all",
                  isEditing && "bg-primary/5",
                  isDragging && "opacity-50 scale-95",
                  isDragOver && "bg-primary/10 border-t-2 border-primary"
                )}
                onClick={() => !isEditing && handleSlotClick(slot.id)}
              >
                {/* Drag handle */}
                <div 
                  className="cursor-grab active:cursor-grabbing mr-2 text-muted-foreground hover:text-foreground touch-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Left: Flag/Icon + Code */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">
                    {asset?.flag || '💱'}
                  </div>
                  
                  <Select
                    value={slot.assetCode}
                    onValueChange={(v) => updateSlotAsset(slot.id, v)}
                  >
                    <SelectTrigger 
                      className="w-auto border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold text-foreground">
                            {slot.assetCode}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {ALL_ASSETS.map((a) => (
                        <SelectItem key={a.code} value={a.code}>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{a.flag}</span>
                            <div>
                              <span className="font-medium">{a.code}</span>
                              <span className="text-muted-foreground ml-2 text-sm">
                                {language === 'fr' ? a.nameFr : a.name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* 24h change indicator for crypto */}
                  {priceChange !== undefined && (
                    <span className={cn(
                      "text-xs font-medium flex items-center gap-0.5",
                      priceChange >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {priceChange >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(priceChange).toFixed(2)}%
                    </span>
                  )}
                </div>

                {/* Right: Value + Name */}
                <div className="flex flex-col items-end">
                  {isEditing ? (
                    <Input
                      type="text"
                      value={baseAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.,]/g, '');
                        setBaseAmount(val);
                      }}
                      className="text-right text-2xl font-semibold h-10 w-36 bg-transparent border-0 border-b-2 border-primary rounded-none shadow-none focus-visible:ring-0 px-0"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-foreground">
                      {formatNumber(value, asset?.decimals || 4)}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground mt-1">
                    {getAssetName(slot.assetCode)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last updated info */}
      {lastUpdated && (
        <div className="px-4 py-3 text-center">
          <span className="text-xs text-muted-foreground">
            {language === 'fr' ? 'Dernière mise à jour: ' : 'Last updated: '}
            {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default CurrencyConversion;
