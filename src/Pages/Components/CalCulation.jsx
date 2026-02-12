import { useCallback, useRef } from "react";

const toNumber = (val) => Number(val) || 0;

function CalCulation(Quantity,PriceBefDi,Discount,Rate=1 ) {
    const quantity = toNumber(Quantity);
    const price = toNumber(PriceBefDi);
    const discount = toNumber(Discount);
    let discountedPrice=price-(price * (discount/100))
    let LineTotal=quantity * discountedPrice  * Rate
    let TotalFrgn=quantity * discountedPrice
    let TotalSumSy=quantity * discountedPrice
    return {
      LineTotal,
      TotalFrgn,
      TotalSumSy,
      discountedPrice,
    };

}

export default CalCulation

export const toPositive = (val) => Math.max(Number(val) || 0, 0);

export const toMinOne = (val) => Math.max(Number(val) || 1, 1);
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};