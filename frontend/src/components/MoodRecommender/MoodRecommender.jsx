import React, { useState, useContext } from 'react'
import './MoodRecommender.css'
import { StoreContext } from '../../context/StoreContext'

const moodOptions = [
  {
    id: 'tired',
    emoji: '😴',
    label: 'Tired',
    title: 'Comfort food for a slow day',
    description: 'A soothing combo to recharge your energy without the fuss.',
    combo: 'Butter noodles + iced tea',
    categories: ['Noodles']
  },
  {
    id: 'party',
    emoji: '🥳',
    label: 'Party mood',
    title: 'Party platter ready',
    description: 'Celebrate with bold, spicy bites and sweet treats.',
    combo: 'Spicy rolls + dessert',
    categories: ['Rolls', 'Deserts']
  },
  {
    id: 'gym',
    emoji: '💪',
    label: 'Gym mode',
    title: 'Power-packed fuel',
    description: 'Protein-rich and filling meals to keep your momentum going.',
    combo: 'Fresh salad + hearty sandwich',
    categories: ['Salad', 'Sandwich', 'Pure Veg']
  },
  {
    id: 'heartbroken',
    emoji: '😭',
    label: 'Heartbroken',
    title: 'A cozy comfort fix',
    description: 'Sweet treats and gentle flavors to soothe the soul.',
    combo: 'Chocolate cake + ice cream',
    categories: ['Cake', 'Deserts']
  },
  {
    id: 'study',
    emoji: '📚',
    label: 'Study night',
    title: 'Late-night coding mood detected 🍜',
    description: 'A smart pairing for long work sessions and focused nights.',
    combo: 'Veg noodles + a warm drink',
    categories: ['Noodles', 'Rolls']
  },
  {
    id: 'hungry',
    emoji: '🍕',
    label: 'Hungry',
    title: 'Ravenous mode',
    description: 'Big appetite? Choose bold, filling favorites to satisfy every craving.',
    combo: 'Chicken rolls + cheese pasta',
    categories: ['Rolls', 'Pasta']
  },
  {
    id: 'chill',
    emoji: '🌿',
    label: 'Chill vibes',
    title: 'Relaxed cravings',
    description: 'Keep it light and fresh with calm, nourishing options.',
    combo: 'Greek salad + a veggie sandwich',
    categories: ['Salad', 'Pure Veg', 'Sandwich']
  },
  {
    id: 'datenight',
    emoji: '💖',
    label: 'Date night',
    title: 'Sweet dinner for two',
    description: 'Enjoy a cozy combo with comforting flavors and dessert to share.',
    combo: 'Grilled sandwich + butterscotch cake',
    categories: ['Sandwich', 'Cake', 'Deserts']
  }
]

const MoodRecommender = ({ setCategory }) => {
  const [selectedMoodId, setSelectedMoodId] = useState('study')
  const { food_list, url } = useContext(StoreContext)

  const selectedMood = moodOptions.find((mood) => mood.id === selectedMoodId)
  const recommendedItems = food_list
    .filter((item) => selectedMood.categories.includes(item.category))
    .slice(0, 3)

  const getImageUrl = (image) =>
    typeof image === 'string' && !image.includes('/') ? `${url}/images/${image}` : image

  const handleMoodSelect = (id, categories) => {
    setSelectedMoodId(id)
    if (setCategory) {
      setCategory(categories[0] || 'All')
    }
  }

  return (
    <div className='mood-recommender'>
      <div className='mood-recommender-header'>
        <div>
          <h1>Feed your mood</h1>
          <p>Select your current mood and get a tailored food + combo recommendation instantly.</p>
        </div>
      </div>

      <div className='mood-recommender-options'>
        {moodOptions.map((mood) => (
          <button
            type='button'
            key={mood.id}
            className={`mood-chip ${selectedMoodId === mood.id ? 'active' : ''}`}
            onClick={() => handleMoodSelect(mood.id, mood.categories)}
          >
            <span>{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>

      <div className='mood-recommender-preview'>
        <div className='mood-recommender-card'>
          <p className='mood-tag'>{selectedMood.emoji} {selectedMood.label}</p>
          <h2>{selectedMood.title}</h2>
          <p>{selectedMood.description}</p>
          <p className='mood-combo'><strong>Suggested combo:</strong> {selectedMood.combo}</p>
          <p className='mood-note'>Menu filtered to <strong>{selectedMood.categories.join(', ')}</strong> when you tap a mood.</p>
        </div>

        <div className='mood-recommender-items'>
          <h3>Recommended dishes</h3>
          {recommendedItems.length > 0 ? (
            <div className='mood-items-grid'>
              {recommendedItems.map((item) => (
                <div key={item._id} className='mood-item-card'>
                  <img src={getImageUrl(item.image)} alt={item.name} />
                  <div>
                    <p>{item.name}</p>
                    <span>${item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='mood-loading'>Loading mood matches...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MoodRecommender
