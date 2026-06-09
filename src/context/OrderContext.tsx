'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  shirtCount: number;
}

export interface ShirtItem {
  designId: string;
  size: string;
  printName: string;
  backNumber: string;
  customText: string; // Custom Text Extra (e.g. Class/Department)
}

export interface OrderSummary {
  basePricePerUnit: number;
  sizeSurchargesTotal: number;
  itemsSubtotal: number;
  shippingFee: number;
  grandTotal: number;
  itemPrices: number[]; // individual prices for each item
  promoCode: string;
  promoType: string; // 'free_shipping' | 'price_discount' | ''
}

interface OrderContextProps {
  userEmail: string | null;
  customerInfo: CustomerInfo;
  shirtItems: ShirtItem[];
  currentStep: string;
  isMounted: boolean;
  promoCode: string;
  promoType: string;
  setPromoCode: (code: string, type?: string) => void;
  login: (email: string) => void;
  logout: () => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  updateShirtItem: (index: number, item: Partial<ShirtItem>) => void;
  setStep: (step: string) => void;
  clearWizard: () => void;
  getSummary: () => OrderSummary;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

const initialCustomerInfo: CustomerInfo = {
  name: '',
  address: '',
  phone: '',
  shirtCount: 1,
};

const initialShirtItem = (): ShirtItem => ({
  designId: 'calm-twilight',
  size: 'S',
  printName: '',
  backNumber: '',
  customText: '',
});

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(initialCustomerInfo);
  const [shirtItems, setShirtItems] = useState<ShirtItem[]>([initialShirtItem()]);
  const [currentStep, setCurrentStep] = useState<string>('info');
  const [promoCode, setPromoCodeState] = useState<string>('');
  const [promoType, setPromoTypeState] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const setPromoCode = (code: string, type: string = '') => {
    setPromoCodeState(code.toUpperCase().trim());
    setPromoTypeState(type);
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEmail = localStorage.getItem('buushirt_user_email');
        const savedInfo = localStorage.getItem('buushirt_customer_info');
        const savedItems = localStorage.getItem('buushirt_shirt_items');
        const savedStep = localStorage.getItem('buushirt_current_step');
        const savedPromo = localStorage.getItem('buushirt_promo_code');
        const savedPromoType = localStorage.getItem('buushirt_promo_type');

        if (savedEmail) setUserEmail(savedEmail);
        if (savedInfo) setCustomerInfo(JSON.parse(savedInfo));
        if (savedItems) setShirtItems(JSON.parse(savedItems));
        if (savedStep) setCurrentStep(savedStep);
        if (savedPromo) setPromoCodeState(savedPromo);
        if (savedPromoType) setPromoTypeState(savedPromoType);
      } catch (err) {
        console.error('Error loading order state from localStorage:', err);
      }
      setIsMounted(true);
    }
  }, []);

  // Save to localStorage when state changes (after mounted)
  useEffect(() => {
    if (!isMounted) return;
    try {
      if (userEmail) {
        localStorage.setItem('buushirt_user_email', userEmail);
      } else {
        localStorage.removeItem('buushirt_user_email');
      }
    } catch (err) {
      console.error(err);
    }
  }, [userEmail, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('buushirt_customer_info', JSON.stringify(customerInfo));
    } catch (err) {
      console.error(err);
    }
  }, [customerInfo, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('buushirt_shirt_items', JSON.stringify(shirtItems));
    } catch (err) {
      console.error(err);
    }
  }, [shirtItems, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('buushirt_current_step', currentStep);
    } catch (err) {
      console.error(err);
    }
  }, [currentStep, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      if (promoCode) {
        localStorage.setItem('buushirt_promo_code', promoCode);
        localStorage.setItem('buushirt_promo_type', promoType);
      } else {
        localStorage.removeItem('buushirt_promo_code');
        localStorage.removeItem('buushirt_promo_type');
      }
    } catch (err) {
      console.error(err);
    }
  }, [promoCode, promoType, isMounted]);

  const login = (email: string) => {
    setUserEmail(email);
    // When a user logs in, we do NOT clear checkout wizard, but per requirements:
    // "Clears previous checkout state and registers the user's email into the session context."
    // Let's reset the wizard state upon a new login!
    clearWizard();
  };

  const logout = () => {
    setUserEmail(null);
    clearWizard();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('buushirt_user_email');
      localStorage.removeItem('buushirt_customer_info');
      localStorage.removeItem('buushirt_shirt_items');
      localStorage.removeItem('buushirt_current_step');
    }
    // Also hit the logout API to clear HTTPOnly cookie
    fetch('/api/auth/logout', { method: 'POST' }).catch((e) => console.error(e));
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo((prev) => {
      const updated = { ...prev, ...info };

      // Validate quantity boundary
      if (updated.shirtCount < 1) updated.shirtCount = 1;
      if (updated.shirtCount > 20) updated.shirtCount = 20;

      // Dynamically resize shirtItems array to match updated shirtCount
      setShirtItems((prevItems) => {
        const count = updated.shirtCount;
        if (prevItems.length === count) return prevItems;
        if (prevItems.length < count) {
          // grow array
          const newItems = [...prevItems];
          while (newItems.length < count) {
            newItems.push(initialShirtItem());
          }
          return newItems;
        } else {
          // shrink array
          return prevItems.slice(0, count);
        }
      });

      return updated;
    });
  };

  const updateShirtItem = (index: number, item: Partial<ShirtItem>) => {
    setShirtItems((prev) => {
      const newItems = [...prev];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], ...item };
      }
      return newItems;
    });
  };

  const setStep = (step: string) => {
    setCurrentStep(step);
  };

  const clearWizard = () => {
    setCustomerInfo(initialCustomerInfo);
    setShirtItems([initialShirtItem()]);
    setCurrentStep('info');
    setPromoCodeState('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('buushirt_customer_info');
      localStorage.removeItem('buushirt_shirt_items');
      localStorage.removeItem('buushirt_promo_code');
      localStorage.setItem('buushirt_current_step', 'info');
    }
  };

  /**
   * Pricing Engine
   * Calculates prices, bulk tiers, shipping fees, and grand total.
   */
  const getSummary = (): OrderSummary => {
    const qty = shirtItems.length;

    // 1. Determine bulk price per shirt based on quantity:
    // * BUY 1:   359 THB/unit + 40 THB Shipping
    // * BUY 3+:  349 THB/unit + 40 THB Shipping
    // * BUY 5+:  339 THB/unit + 60 THB Shipping
    // * BUY 10+: 329 THB/unit + 80 THB Shipping
    // * BUY 20+: 319 THB/unit + 80 THB Shipping
    let basePricePerUnit = 359;
    let shippingFee = 40;

    if (qty >= 20) {
      basePricePerUnit = 319;
      shippingFee = 80;
    } else if (qty >= 10) {
      basePricePerUnit = 329;
      shippingFee = 80;
    } else if (qty >= 5) {
      basePricePerUnit = 339;
      shippingFee = 60;
    } else if (qty >= 3) {
      basePricePerUnit = 349;
      shippingFee = 40;
    } else {
      basePricePerUnit = 359;
      shippingFee = 40;
    }

    // Apply promo codes if present
    let appliedPromoType = '';
    const code = promoCode.toUpperCase().trim();
    if (code) {
      const type = promoType || (
        (code.includes('299') || code.includes('CUTIES')) ? 'price_discount' : 'free_shipping'
      );
      if (type === 'free_shipping' && qty >= 5) {
        shippingFee = 0;
        appliedPromoType = 'free_shipping';
      } else if (type === 'price_discount' && qty >= 20) {
        basePricePerUnit = 299;
        appliedPromoType = 'price_discount';
      }
    }

    // 2. Calculate individual sizes addition:
    // S, M, L, XL: 0
    // 2XL: +10 THB
    // 3XL: +20 THB
    // 4XL: +30 THB
    // 5XL: +40 THB
    let sizeSurchargesTotal = 0;
    const itemPrices: number[] = [];

    shirtItems.forEach((item) => {
      let extra = 0;
      if (item.size === '2XL') extra = 10;
      else if (item.size === '3XL') extra = 20;
      else if (item.size === '4XL') extra = 30;
      else if (item.size === '5XL') extra = 40;

      sizeSurchargesTotal += extra;
      itemPrices.push(basePricePerUnit + extra);
    });

    const itemsSubtotal = (basePricePerUnit * qty) + sizeSurchargesTotal;
    const grandTotal = itemsSubtotal + shippingFee;

    return {
      basePricePerUnit,
      sizeSurchargesTotal,
      itemsSubtotal,
      shippingFee,
      grandTotal,
      itemPrices,
      promoCode,
      promoType: appliedPromoType,
    };
  };

  return (
    <OrderContext.Provider
      value={{
        userEmail,
        customerInfo,
        shirtItems,
        currentStep,
        isMounted,
        promoCode,
        promoType,
        setPromoCode,
        login,
        logout,
        updateCustomerInfo,
        updateShirtItem,
        setStep,
        clearWizard,
        getSummary,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
