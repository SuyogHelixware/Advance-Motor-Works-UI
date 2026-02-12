import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCounter } from "../slices/CounterSlice";

export const useCounterPolling = (Menuname,dep) => {
  const dispatch = useDispatch();
 useEffect(() => {
    if (!Menuname) return;
    dispatch(fetchCounter(Menuname));
    const interval = setInterval(() => {
      dispatch(fetchCounter(Menuname));
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [dispatch, Menuname, dep]);;
};
