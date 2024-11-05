import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')

  return (
    <div className="app">
      <h1>Semantic Desktop Search</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your RDF knowledge base..."
          className="search-input"
        />
      </div>
    </div>
  )
}

export default App
