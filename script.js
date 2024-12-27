const baseUrl = "https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com"
const apiKeyEndpoint = "/keys"
const bodiesEndpoint = "/bodies"

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput")
  const planetContainer = document.getElementById("planet-container")
  let apiKey = null

  // Funktion för att hämta API-nyckeln
  async function fetchApiKey() {
    try {
      const response = await fetch(baseUrl + apiKeyEndpoint, { method: "POST" })
      if (!response.ok) {
        throw new Error(`Misslyckades med att hämta API-nyckel: ${response.status}`)
      }
      const keyObject = await response.json() // Tolka svaret som JSON
      const key = keyObject.key // Extrahera nyckeln från svaret
      console.log("Hämtade API-nyckel:", key) // Logga nyckeln
      apiKey = key // Spara nyckeln i den globala variabeln
      return key
    } catch (error) {
      console.error("Fel vid hämtning av API-nyckel:", error)
      throw error
    }
  }

  // Funktion för att hämta planetdata från API:et
  async function fetchPlanets() {
    if (!apiKey) {
      console.error("API-nyckel saknas. Kan inte hämta planeter.")
      return
    }

    try {
      const response = await fetch(baseUrl + bodiesEndpoint, {
        method: "GET",
        headers: { "x-zocom": apiKey },
      })

      if (!response.ok) {
        throw new Error(`API-fel: ${response.status}`)
      }

      const result = await response.json() // Tolka API-svaret som JSON
      console.log(result) // Inspektera svaret i konsolen

      const planets = result.bodies // Hämta planetlistan

      if (!Array.isArray(planets)) {
        throw new Error("API-svaret är inte en array")
      }

      displayPlanets(planets) // Visa planeterna på sidan
    } catch (error) {
      console.error("Misslyckades med att hämta planeter:", error)
      if (planetContainer) {
        planetContainer.innerHTML =
          "<p>Fel vid laddning av planeter. Försök igen senare.</p>"
      }
    }
  }

  // Funktion för att visa planeterna på sidan
  function displayPlanets(planets) {
    planetContainer.innerHTML = "" // Rensa tidigare innehåll

    planets.forEach((planet) => {
      const planetButton = document.createElement("button") // Skapa knapp för varje planet
      planetButton.className = `planet ${planet.name.toLowerCase()}`
      planetButton.innerHTML = `<span class="planet-name">${planet.name}</span>`

      // Lägg till effekter vid muspekaren över knappen
      planetButton.addEventListener("mouseenter", () => {
        planetButton.style.transform = "scale(1.2)"
        planetButton.style.boxShadow = "0 0 25px 15px rgba(255, 255, 255, 0.5)"
      })
      planetButton.addEventListener("mouseleave", () => {
        planetButton.style.transform = "scale(1)"
        planetButton.style.boxShadow = "none"
      })

      // Lägg till en klickhändelse för att visa detaljer om planeten
      planetButton.addEventListener("click", () => {
        displayPlanetDetails(planet)
      })

      planetContainer.appendChild(planetButton) // Lägg till knappen i behållaren
    })
  }

  // Funktion för att visa detaljer om en specifik planet
  function displayPlanetDetails(planet) {
    let modal = document.querySelector(".modal") // Kontrollera om modal redan finns
    if (!modal) {
      // Om inte, skapa en ny modal
      modal = document.createElement("div")
      modal.className = "modal"
      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <div id="modal-details"></div>
        </div>
      `
      document.body.appendChild(modal)

      // Lägg till händelser för att stänga modal
      modal.querySelector(".modal-close").addEventListener("click", () => {
        modal.style.display = "none"
      })
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none"
        }
      })
    }

    const details = modal.querySelector("#modal-details") // Behållare för planetdetaljer
    details.innerHTML = `
      <h2>${planet.name} (${planet.latinName})</h2>
      <p><strong>Beskrivning:</strong> ${planet.desc}</p>
      <p><strong>Typ:</strong> ${planet.type}</p>
      <p><strong>Rotation:</strong> ${planet.rotation} Jorddagar</p>
      <p><strong>Omloppstid:</strong> ${planet.orbitalPeriod} Jorddagar</p>
      <p><strong>Avstånd från solen:</strong> ${planet.distance} km</p>
      <p><strong>Temperatur:</strong> Dag: ${planet.temp.day}°C, Natt: ${planet.temp.night}°C</p>
      <p><strong>Månar:</strong> ${
        planet.moons.length > 0 ? planet.moons.join(", ") : "Inga"
      }</p>
    `

    modal.style.display = "flex" // Visa modal
  }

  // Händelse för att filtrera planeter baserat på sökfältets värde
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase().trim() // Hämta och normalisera söktext
    const planets = Array.from(planetContainer.children) // Hämta alla planetknappar

    planets.forEach((planet) => {
      const planetName = planet
        .querySelector(".planet-name")
        .textContent.toLowerCase() // Hämta planetens namn
      if (planetName.includes(query)) {
        planet.style.display = "flex" // Visa om det matchar söktexten
      } else {
        planet.style.display = "none" // Dölj annars
      }
    })
  })

  // Initiera applikationen
  ;(async () => {
    try {
      await fetchApiKey() // Hämta API-nyckel
      fetchPlanets() // Hämta och visa planeter
    } catch (error) {
      console.error("Initialisering misslyckades:", error)
      if (planetContainer) {
        planetContainer.innerHTML =
          "<p>Initialisering misslyckades. Försök igen senare.</p>"
      }
    }
  })()
})
