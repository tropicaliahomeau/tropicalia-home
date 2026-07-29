import { supabase } from '@/lib/supabaseClient';

export function getSydneyStatus(now = new Date()) {
    // Convert current time to Sydney timezone
    const sydneyStr = now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' });
    const sydneyTime = new Date(sydneyStr);
    
    const day = sydneyTime.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hours = sydneyTime.getHours();
    const minutes = sydneyTime.getMinutes();
    const timeVal = hours * 60 + minutes; // minutes since midnight
    
    let isClosedWindow = false;
    const targetSunday = new Date(sydneyTime);
    
    // Calculate Sunday of current week
    const daysToSunday = (7 - day) % 7;
    targetSunday.setDate(sydneyTime.getDate() + daysToSunday);
    targetSunday.setHours(0, 0, 0, 0);
    
    // Friday 11:59 PM to Saturday 1:00 AM (Sydney)
    if ((day === 5 && timeVal >= 1439) || (day === 6 && timeVal < 60)) {
        isClosedWindow = true;
    }
    
    // Switch to next week if we are past Saturday 1:00 AM
    const isNextWeek = (day === 6 && timeVal >= 60) || (day === 0);
    if (isNextWeek) {
        targetSunday.setDate(targetSunday.getDate() + 7);
    }
    
    return {
        targetSunday,
        isClosedWindow
    };
}

export function getWeekIndexForSunday(sundayDate: Date): number {
    const baseSunday = new Date('2026-04-12T00:00:00'); // Week 1 base in Sydney
    const msDiff = sundayDate.getTime() - baseSunday.getTime();
    const daysDiff = Math.round(msDiff / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.round(daysDiff / 7);
    
    let idx = weeksDiff % 3;
    if (idx < 0) idx += 3;
    
    return idx; // 0 for Week 1, 1 for Week 2, 2 for Week 3
}

export function formatDeliveryDate(date: Date): string {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";
    
    return `Week - Delivery ${month} ${day}${suffix}`;
}

export function getWeekDeliverySunday(weekId: string, targetSunday: Date): Date {
    const activeWeekIndex = getWeekIndexForSunday(targetSunday);
    const weekIndex = parseInt(weekId.replace('week-', '')) - 1; // 0, 1, 2
    const diff = (weekIndex - activeWeekIndex + 3) % 3;
    const weekSunday = new Date(targetSunday.getTime());
    weekSunday.setDate(targetSunday.getDate() + diff * 7);
    return weekSunday;
}

export function getWeekName(weekId: string, targetSunday: Date): string {
    const weekSunday = getWeekDeliverySunday(weekId, targetSunday);
    return formatDeliveryDate(weekSunday);
}

export async function syncWeeklyMenus(dbWeeks: any[]): Promise<boolean> {
    const { targetSunday, isClosedWindow } = getSydneyStatus();
    const activeWeekIndex = getWeekIndexForSunday(targetSunday);
    
    // Sort dbWeeks by semana_inicio to map to week indices 0, 1, 2
    const sortedWeeks = [...dbWeeks].sort((a, b) => a.semana_inicio.localeCompare(b.semana_inicio));
    
    const enabledDbIndex = sortedWeeks.findIndex(w => w.is_enabled);
    const previousWeekIndex = (activeWeekIndex - 1 + 3) % 3;
    
    const isOutdated = enabledDbIndex === previousWeekIndex || (enabledDbIndex === -1 && !isClosedWindow);
    
    let didUpdate = false;
    
    if (isOutdated) {
        for (let i = 0; i < sortedWeeks.length; i++) {
            const shouldEnable = i === activeWeekIndex && !isClosedWindow;
            if (sortedWeeks[i].is_enabled !== shouldEnable) {
                const { error } = await supabase
                    .from('weekly_menus')
                    .update({ is_enabled: shouldEnable })
                    .eq('id', sortedWeeks[i].id);
                if (!error) didUpdate = true;
            }
        }
    } else if (isClosedWindow && enabledDbIndex !== -1) {
        for (let i = 0; i < sortedWeeks.length; i++) {
            if (sortedWeeks[i].is_enabled) {
                const { error } = await supabase
                    .from('weekly_menus')
                    .update({ is_enabled: false })
                    .eq('id', sortedWeeks[i].id);
                if (!error) didUpdate = true;
            }
        }
    }
    
    return didUpdate;
}
