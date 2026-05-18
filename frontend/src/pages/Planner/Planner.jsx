import React, { useMemo, useState, useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './Planner.css'

const activityLevels = [
  { value: 'Sedentary', label: 'Sedentary (little or no exercise)', factor: 1.2 },
  { value: 'Lightly active', label: 'Light exercise 1-3 days/week', factor: 1.375 },
  { value: 'Moderately active', label: 'Moderate exercise 3-5 days/week', factor: 1.55 },
  { value: 'Very active', label: 'Hard exercise 6-7 days/week', factor: 1.725 },
  { value: 'Extremely active', label: 'Very hard exercise / physical job', factor: 1.9 },
]

const goals = [
  { value: 'Weight Loss', label: 'Weight Loss' },
  { value: 'Weight Gain', label: 'Weight Gain' },
  { value: 'Muscle Gain', label: 'Muscle Gain' },
  { value: 'Weight Maintenance', label: 'Weight Maintenance' },
]

const mealGroups = {
  breakfast: ['Sandwich', 'Cake', 'Salad', 'Rolls'],
  lunch: ['Rolls', 'Pasta', 'Noodles', 'Pure Veg'],
  dinner: ['Pure Veg', 'Sandwich', 'Noodles', 'Pasta'],
  snacks: ['Deserts', 'Cake'],
}

const allergens = ['milk', 'dairy', 'egg', 'soy', 'gluten', 'nuts', 'wheat', 'chocolate']

const Planner = () => {
  const { food_list, addToCart } = useContext(StoreContext)
  const [form, setForm] = useState({
    goal: 'Weight Loss',
    currentWeight: 78,
    targetWeight: 70,
    height: 172,
    age: 26,
    gender: 'Male',
    activityLevel: 'Moderately active',
    diet: 'Non-veg',
    allergies: '',
    budget: 20,
    duration: 90,
    hostelMode: false,
  })
  const [planner, setPlanner] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [skipped, setSkipped] = useState({})

  const selectedActivity = activityLevels.find((item) => item.value === form.activityLevel) || activityLevels[0]

  const filteredFoods = useMemo(() => {
    const allergyTokens = form.allergies
      .toLowerCase()
      .split(/[,;\s]+/)
      .filter(Boolean)

    return food_list.filter((item) => {
      if (form.diet === 'Veg' && /chicken|meat|egg|fish|prawn|shrimp/i.test(item.name)) {
        return false
      }
      const lowercaseName = item.name.toLowerCase()
      for (const token of [...allergyTokens, ...allergens]) {
        if (token && lowercaseName.includes(token)) {
          if (form.allergies.toLowerCase().includes(token)) {
            return false
          }
        }
      }
      return true
    })
  }, [food_list, form.diet, form.allergies])

  const getFoodForCategory = (categories) => {
    const options = filteredFoods.filter((item) => categories.includes(item.category))
    if (!options.length) return null

    const sorted = [...options].sort((a, b) => a.price - b.price)
    const budgetScore = Number(form.budget) || 0
    if (form.hostelMode || budgetScore > 0) {
      return sorted[0]
    }
    return sorted[Math.floor(Math.random() * sorted.length)]
  }

  const shuffle = (arr) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const buildCycle = (options, cycleLength, forWeightGain) => {
    if (!options || !options.length) return []
    const unique = [...new Map(options.map((o) => [o._id, o])).values()]
    if (unique.length <= cycleLength) return unique.slice()

    if (forWeightGain) {
      // prefer higher-calorie / higher-price items for weight gain: sort desc by price
      return unique.sort((a, b) => b.price - a.price).slice(0, cycleLength)
    }

    // otherwise create a randomized cycle of distinct items
    return shuffle(unique).slice(0, cycleLength)
  }

  const calculateBMR = () => {
    const weight = Number(form.currentWeight) || 0
    const height = Number(form.height) || 0
    const age = Number(form.age) || 0
    if (form.gender === 'Female') {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161)
    }
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5)
  }

  const generatePlan = () => {
    const bmr = calculateBMR()
    const dailyCalories = Math.max(
      1100,
      Math.round(
        bmr * selectedActivity.factor +
          ((Number(form.targetWeight) - Number(form.currentWeight)) * 7700) / Number(form.duration)
      )
    )

    const macronutrients = {
      protein: Math.round((dailyCalories * 0.28) / 4),
      carbs: Math.round((dailyCalories * 0.45) / 4),
      fat: Math.round((dailyCalories * 0.27) / 9),
    }

    // choose cycle length based on goal: default 5-day unique cycle, 3-day for weight gain
    const cycleLength = form.goal === 'Weight Gain' ? 3 : 5

    // prepare cycles for each meal to ensure items repeat only after cycle completes
    const mealCycles = {}
    ;['breakfast', 'lunch', 'dinner', 'snacks'].forEach((mealKey) => {
      const categories = mealGroups[mealKey]
      const options = filteredFoods.filter((item) => categories.includes(item.category))
      mealCycles[mealKey] = buildCycle(options, cycleLength, form.goal === 'Weight Gain')
    })

    const dailyPlans = Array.from({ length: Number(form.duration) }, (_, index) => {
      const day = index + 1
      const isCheatDay = day % 7 === 0 && Number(form.duration) >= 30
      // if cheat day, pick from cheat categories (random/fallback behavior)
      const breakfast = isCheatDay
        ? getFoodForCategory(['Cake', 'Sandwich'])
        : (mealCycles.breakfast[(day - 1) % cycleLength] || getFoodForCategory(mealGroups.breakfast))
      const lunch = isCheatDay
        ? getFoodForCategory(['Rolls', 'Pasta'])
        : (mealCycles.lunch[(day - 1) % cycleLength] || getFoodForCategory(mealGroups.lunch))
      const dinner = isCheatDay
        ? getFoodForCategory(['Noodles', 'Pure Veg'])
        : (mealCycles.dinner[(day - 1) % cycleLength] || getFoodForCategory(mealGroups.dinner))
      const snacks = isCheatDay
        ? getFoodForCategory(['Deserts', 'Cake'])
        : (mealCycles.snacks[(day - 1) % cycleLength] || getFoodForCategory(mealGroups.snacks))
      const water = Number((2.2 + selectedActivity.factor * 0.5).toFixed(1))
      return {
        day,
        isCheatDay,
        breakfast,
        lunch,
        dinner,
        snacks,
        water,
        calories: dailyCalories + (isCheatDay ? 120 : 0),
        macros: macronutrients,
      }
    })

    const targetShift = Math.abs(Number(form.targetWeight) - Number(form.currentWeight))
    const transformation = Math.min(100, Math.round((targetShift / Math.max(1, targetShift)) * 100))

    setPlanner({
      bmr,
      dailyCalories,
      macronutrients,
      dailyPlans,
      topRecommendation: filteredFoods.slice(0, 4),
      transformation,
    })
  }

  const handleSkip = (day) => {
    setSkipped((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  const disciplineScore = planner
    ? Math.max(40, 100 - Object.values(skipped).filter(Boolean).length * 4)
    : 0
  const streak = planner
    ? Math.max(0, Number(form.duration) - Object.values(skipped).filter(Boolean).length)
    : 0

  return (
    <div className={`planner-page ${darkMode ? 'dark' : ''}`}>
      <div className='planner-hero'>
        <div>
          <span className='planner-badge'>90-Day Transformation</span>
          <h1>AI-Based Goal-Oriented Nutrition Planner</h1>
          <p>Set your goal and get a personalized meal roadmap with calorie targets, macro breakdowns, cheat day pacing, hydration reminders and order-ready recommendations.</p>
        </div>
        <button className='theme-toggle' onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <div className='planner-layout'>
        <section className='planner-form-card'>
          <h2>Build your program</h2>
          <div className='planner-form-grid'>
            <label>
              Goal
              <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                {goals.map((goal) => (
                  <option key={goal.value} value={goal.value}>{goal.label}</option>
                ))}
              </select>
            </label>
            <label>
              Current weight (kg)
              <input type='number' value={form.currentWeight} onChange={(e) => setForm({ ...form, currentWeight: e.target.value })} />
            </label>
            <label>
              Target weight (kg)
              <input type='number' value={form.targetWeight} onChange={(e) => setForm({ ...form, targetWeight: e.target.value })} />
            </label>
            <label>
              Height (cm)
              <input type='number' value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} />
            </label>
            <label>
              Age
              <input type='number' value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </label>
            <label>
              Gender
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Activity level
              <select value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
                {activityLevels.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <label>
              Diet preference
              <select value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })}>
                <option>Non-veg</option>
                <option>Veg</option>
              </select>
            </label>
            <label>
              Allergies / restrictions
              <input type='text' value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder='e.g. dairy, nuts' />
            </label>
            <label>
              Daily budget ($)
              <input type='number' value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </label>
            <label>
              Duration
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </label>
            <label className='toggle-row'>
              <span>Hostel survival diet mode</span>
              <input type='checkbox' checked={form.hostelMode} onChange={(e) => setForm({ ...form, hostelMode: e.target.checked })} />
            </label>
          </div>
          <button className='planner-action-btn' onClick={generatePlan}>Generate roadmap</button>
        </section>

        <section className='planner-glance-card'>
          <div className='planner-glance-header'>
            <div>
              <p className='small-label'>Goal insight</p>
              <h2>{form.goal} plan</h2>
            </div>
            <span className='duration-pill'>{form.duration} days</span>
          </div>
          <div className='planner-metrics-grid'>
            <div className='metric-card'>
              <p>Total calories</p>
              <strong>{planner ? `${planner.dailyCalories} kcal` : '—'}</strong>
            </div>
            <div className='metric-card'>
              <p>Hydration</p>
              <strong>{planner ? `${2.2 + selectedActivity.factor * 0.5} L` : '—'}</strong>
            </div>
            <div className='metric-card'>
              <p>Protein</p>
              <strong>{planner ? `${planner.macronutrients.protein} g` : '—'}</strong>
            </div>
            <div className='metric-card'>
              <p>Carbs</p>
              <strong>{planner ? `${planner.macronutrients.carbs} g` : '—'}</strong>
            </div>
            <div className='metric-card'>
              <p>Fat</p>
              <strong>{planner ? `${planner.macronutrients.fat} g` : '—'}</strong>
            </div>
            <div className='metric-card'>
              <p>Discipline score</p>
              <strong>{planner ? `${disciplineScore}%` : '—'}</strong>
            </div>
          </div>
          <div className='planner-progress-box'>
            <p>Consistency streak</p>
            <div className='progress-bar'>
              <div className='progress-fill' style={{ width: planner ? `${Math.min(100, (streak / form.duration) * 100)}%` : '0%' }} />
            </div>
            <p>{planner ? `${streak} / ${form.duration} days` : 'Start the plan to see progress'}</p>
          </div>
          <div className='planner-preview-list'>
            <h3>Sample daily roadmap</h3>
            {planner ? (
              planner.dailyPlans.slice(0, 3).map((day) => (
                <div key={day.day} className='preview-day-card'>
                  <h4>{day.isCheatDay ? `Day ${day.day} • Cheat day` : `Day ${day.day}`}</h4>
                  <p>{day.breakfast?.name || 'Breakfast TBD'} · {day.lunch?.name || 'Lunch TBD'}</p>
                  <p>{day.dinner?.name || 'Dinner TBD'} · {day.snacks?.name || 'Snack TBD'}</p>
                </div>
              ))
            ) : (
              <p className='note-text'>Generate your roadmap to preview the first few days and learn what to order.</p>
            )}
          </div>
        </section>
      </div>

      {planner && (
        <section className='planner-daily-list'>
          <div className='daily-list-header'>
            <h2>Daily meal roadmap</h2>
            <p>This plan is tailored with friendly, budget-aware meals and direct ordering options for every day.</p>
          </div>
          <div className='daily-cards'>
            {planner.dailyPlans.map((day) => (
              <div key={day.day} className={`day-card ${day.isCheatDay ? 'cheat-day' : ''}`}>
                <div className='day-card-header'>
                  <div>
                    <h3>Day {day.day}</h3>
                    <p>{day.isCheatDay ? 'Cheat day boost' : 'Nutrition-focused day'}</p>
                  </div>
                  <button className={skipped[day.day] ? 'skip-btn active' : 'skip-btn'} onClick={() => handleSkip(day.day)}>
                    {skipped[day.day] ? 'Skipped meal' : 'Mark skipped'}
                  </button>
                </div>
                <div className='meal-grid'>
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealKey) => {
                    const meal = day[mealKey]
                    return (
                      <div key={mealKey} className='meal-card'>
                        <p className='meal-type'>{mealKey}</p>
                        <p className='meal-name'>{meal?.name || 'Suggested item not found'}</p>
                        <p className='meal-meta'>{meal ? `${meal.category} • $${meal.price}` : 'Adjust filters for more options'}</p>
                        {meal && (
                          <button className='order-btn' onClick={() => addToCart(meal._id)}>
                            Add to cart
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className='day-summary'>
                  <p>Hydration: {day.water} L</p>
                  <p>Calories: {day.calories} kcal</p>
                  <p>Macros: {day.macros.protein}P / {day.macros.carbs}C / {day.macros.fat}F</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Planner
