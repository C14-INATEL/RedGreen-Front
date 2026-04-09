export const IsBirthDateFormatValid = (Value: string) => {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(Value);
};

export const IsValidBirthDate = (Value: string) => {
  const [Day, Month, Year] = Value.split('/').map(Number);

  if (Month < 1 || Month > 12) return false;
  if (Day < 1 || Day > 31) return false;

  const DateObj = new Date(Year, Month - 1, Day);

  const IsRealDate =
    DateObj.getFullYear() === Year &&
    DateObj.getMonth() === Month - 1 &&
    DateObj.getDate() === Day;

  if (!IsRealDate) return false;

  const Today = new Date();
  Today.setHours(0, 0, 0, 0);
  DateObj.setHours(0, 0, 0, 0);

  if (DateObj > Today) return false;

  return true;
};
