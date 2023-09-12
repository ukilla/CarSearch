import { Observable, catchError, from, map } from "rxjs";
import { Car } from "../models/car";

const BASE_URL = "http://localhost:3000";

export function fetchCars(): Observable<any> {
  return from(
    fetch(`${BASE_URL}/cars`).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
  ).pipe(
    map((data) => {
      return data;
    }),
    catchError((error) => {
      console.error("Error fetching:", error);
      throw error;
    })
  );
}

export function fetchUserInputCar(
  manufacturer: string,
  model: string,
  engine: string,
  manufacturingYearFrom: number,
  manufacturingYearTo: number
): Observable<any> {
  return from(
    fetch(`${BASE_URL}/carsPerformance`).then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
  ).pipe(
    map((data) => {
      return data.find((car: any) => {
        return (
          car.manufacturer === manufacturer &&
          car.model === model &&
          car.engine === engine &&
          car.manufacturingYearFrom <= manufacturingYearFrom &&
          car.manufacturingYearTo >= manufacturingYearTo
        );
      });
    }),
    catchError((error) => {
      console.error("Error fetching:", error);
      throw error;
    })
  );
}
