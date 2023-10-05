import dotenv from "dotenv";
import { scheduleClasses } from "./schedule.js";
import { DateTime } from "luxon";
import ArboxApi from "./arboxApi.mjs";

dotenv.config({
  path: "./.env",
});

const dateOfDayNextWeek = (dayName) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const inputDayIndex = days.indexOf(dayName) + 1;

  if (inputDayIndex < 0) {
    throw new Error();
  }

  const currentDayOfWeek = DateTime.now().setZone("Asia/Jerusalem").weekday;
  const dayDifference = inputDayIndex - currentDayOfWeek;

  return DateTime.now()
    .setZone("Asia/Jerusalem")
    .plus({ days: 7 + dayDifference })
    .startOf("day")
    .toUTC()
    .toISO();
};

export const enrollToLessons = async () => {
  const api = new ArboxApi(
    process.env.ARBOX_EMAIL,
    process.env.ARBOX_PASSWORD,
    process.env.ARBOX_WHITELABEL
  );

  await api.loginArbox();

  let schedule = scheduleClasses;

  for (const lesson of schedule) {
    const classDate = dateOfDayNextWeek(lesson.day);
    const leasonSchedule = await api.getScheduleByDate(classDate, lesson.boxId);

    for (const workout of leasonSchedule) {
      if (
        workout.time == lesson.start_time &&
        workout.box_categories.id == lesson.location_id
      ) {
        try {
          await api.registerWorkout(workout.id);
          console.log(
            `time: ${workout.time}, location: ${workout.box_categories.name}`
          );
        } catch (e) {
          console.log("error in enroll To lessons", e);
        }
      }
    }
  }
  return "finished scheduling";
};