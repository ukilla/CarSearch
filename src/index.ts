import {
  Subject,
  combineLatest,
  fromEvent,
  map,
  startWith,
  switchMap,
} from "rxjs";
import { Car } from "./models/car";
import { fetchCars, fetchUserInputCar } from "./observables/apiService";

const manufacturerSelect = document.createElement("select");
manufacturerSelect.setAttribute("placeholder", "Car Manufacturer");
manufacturerSelect.setAttribute("id", "manufacturerSelect");

const modelSelect = document.createElement("select");
modelSelect.setAttribute("placeholder", "Car Model");
modelSelect.setAttribute("id", "modelSelect");

const engineSelect = document.createElement("select");
engineSelect.setAttribute("placeholder", "Engine type");
engineSelect.setAttribute("id", "engineSelect");

const fromYearsInput = document.createElement("input");
fromYearsInput.setAttribute("type", "number");
fromYearsInput.setAttribute("placeholder", "From Manufacturing Year");

const toYearsInput = document.createElement("input");
toYearsInput.setAttribute("type", "number");
toYearsInput.setAttribute("placeholder", "To Manufacturing Year");

const submitButton = document.createElement("input");
submitButton.setAttribute("type", "submit");

const manufacturerSelect$ = fromEvent(manufacturerSelect, "change").pipe(
  map((event) => (event.target as HTMLSelectElement).value)
);

const modelSelect$ = fromEvent(modelSelect, "change").pipe(
  map((event) => (event.target as HTMLSelectElement).value)
);

const engineSelect$ = fromEvent(engineSelect, "change").pipe(
  map((event) => (event.target as HTMLSelectElement).value)
);

const fromYearsInput$ = fromEvent(fromYearsInput, "change").pipe(
  map((event) => (event.target as HTMLSelectElement).value)
);

const toYearsInput$ = fromEvent(toYearsInput, "change").pipe(
  map((event) => (event.target as HTMLSelectElement).value)
);

const form = document.createElement("form");
form.appendChild(manufacturerSelect);
form.appendChild(modelSelect);
form.appendChild(engineSelect);
form.appendChild(fromYearsInput);
form.appendChild(toYearsInput);
form.appendChild(submitButton);
document.body.appendChild(form);

combineLatest([
  manufacturerSelect$,
  modelSelect$,
  engineSelect$,
  fromYearsInput$,
  toYearsInput$,
]).subscribe(([manufacturer, model, engine, fromYears, toYears]) => {
  fetchUserInputCar(
    manufacturer,
    model,
    engine,
    parseInt(fromYears),
    parseInt(toYears)
  ).subscribe((car) => {
    if (car) {
      createCarInfoDiv(car);
    } else {
      createNoCarInfo();
    }
  });
});

fromEvent(form, "submit")
  .pipe(
    switchMap((event) => {
      event.preventDefault();
      const manufacturer = manufacturerSelect.value;
      const model = modelSelect.value;
      const engine = engineSelect.value;
      const fromYear = parseInt(fromYearsInput.value);
      const toYear = parseInt(toYearsInput.value);
      return fetchUserInputCar(manufacturer, model, engine, fromYear, toYear);
    })
  )
  .subscribe(
    (car) => {
      if (car) {
        createCarInfoDiv(car);
      } else {
        createNoCarInfo();
      }
    },
    (error) => {
      console.error("Error fetching car:", error);
    }
  );
let carData: any;
window.addEventListener("load", () => {
  fetchCars().subscribe(
    (data) => {
      carData = data;
      const manufacturerSelect = document.getElementById("manufacturerSelect");

      const manufacturers = [
        ...new Set(data.map((car: Car) => car.manufacturer)),
      ];

      manufacturers.forEach((manufacturer) => {
        const option = document.createElement("option");
        option.value = manufacturer as string;
        option.text = manufacturer as string;
        manufacturerSelect.appendChild(option);
      });
    },
    (error) => {
      console.error(error);
    }
  );
});

manufacturerSelect.addEventListener("change", () => {
  const selectedManufacturer = manufacturerSelect.value;

  const models = carData
    .filter((car: Car) => car.manufacturer === selectedManufacturer)
    .map((car: Car) => car.model);

  modelSelect.innerHTML = "";

  models.forEach((model: string) => {
    const option = document.createElement("option");
    option.value = model;
    option.text = model;
    modelSelect.appendChild(option);
  });
});

function filterEngines(
  manufacturer: string,
  selectedModels: string[],
  carData: any
) {
  return carData.filter((car: Car) => {
    if (car.manufacturer !== manufacturer) {
      return false;
    }
    return selectedModels.includes(car.model);
  });
}

manufacturerSelect.addEventListener("change", updateFilteredEngines);
modelSelect.addEventListener("change", updateFilteredEngines);

function updateFilteredEngines() {
  const selectedManufacturer = manufacturerSelect.value;
  const selectedModels = Array.from(modelSelect.selectedOptions).map(
    (option) => option.value
  );

  const filteredEngines = filterEngines(
    selectedManufacturer,
    selectedModels,
    carData
  );

  const engineSelect = document.getElementById("engineSelect");
  engineSelect.innerHTML = "";

  filteredEngines.forEach((car: Car) => {
    car.engines.forEach((engine) => {
      const option = document.createElement("option");
      option.value = engine;
      option.textContent = engine;
      engineSelect.appendChild(option);
    });
  });
}

function createCarInfoDiv(car: any) {
  const test = document.querySelector(".noCarsDiv");
  if (test) {
    test.remove();
  }
  const carInfoDiv = document.createElement("div");
  carInfoDiv.classList.add("car-info");

  const manufacturerModel = document.createElement("h2");
  manufacturerModel.textContent = `${car.manufacturer} ${car.model}`;

  const years = document.createElement("p");
  years.textContent = `Manufacturing Years: ${car.manufacturingYearFrom} - ${car.manufacturingYearTo}`;

  const descriptionHeader = document.createElement("h3");
  descriptionHeader.textContent = `Description`;
  const description = document.createElement("p");
  description.textContent = `${car.description}`;

  const horsepower = document.createElement("p");
  horsepower.textContent = `Horsepower: ${car.horsepower}`;

  const suspensionHeading = document.createElement("h3");
  suspensionHeading.textContent = "Suspension";
  const suspensionList = document.createElement("ul");

  const lapsHeader = document.createElement("h3");
  lapsHeader.textContent = `Laps`;

  for (const subAttribute in car.suspension) {
    const subItem = document.createElement("li");
    subItem.textContent = `${subAttribute}: ${car.suspension[subAttribute]}`;
    suspensionList.appendChild(subItem);
  }

  const lapsList = document.createElement("ul");
  for (const circuit in car.laps) {
    const lapItem = document.createElement("li");
    lapItem.textContent = `${circuit}: ${car.laps[circuit]}`;
    lapsList.appendChild(lapItem);
  }

  carInfoDiv.appendChild(manufacturerModel);
  carInfoDiv.appendChild(years);
  carInfoDiv.appendChild(horsepower);
  carInfoDiv.appendChild(suspensionHeading);
  carInfoDiv.appendChild(suspensionList);
  carInfoDiv.appendChild(descriptionHeader);
  carInfoDiv.appendChild(description);
  carInfoDiv.appendChild(lapsHeader);
  carInfoDiv.appendChild(lapsList);
  document.body.appendChild(carInfoDiv);
  return carInfoDiv;
}

function createNoCarInfo() {
  const test = document.querySelector(".noCarsDiv");
  const test2=document.querySelector('.car-info')
  if (test) {
    test.remove();
  }
  else if(test2){
    test2.remove();
  }
  const noCarsDiv = document.createElement("div");
  const noCarsH2 = document.createElement("h2");
  noCarsDiv.classList.add("noCarsDiv");
  noCarsH2.textContent = "There are no cars that match the search criteria.";
  noCarsDiv.appendChild(noCarsH2);
  document.body.appendChild(noCarsDiv);
}
