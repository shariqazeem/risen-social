'use client'

import { useState } from 'react'

interface CreateProposalProps {
  creatorAddress: string
  onClose: () => void
  onCreated: () => void
}

export function CreateProposal({ creatorAddress, onClose, onCreated }: CreateProposalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [duration, setDuration] = useState(72)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addOption = () => {
    if (options.length < 4) setOptions([...options, ''])
  }

  const updateOption = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }
    const validOptions = options.filter(o => o.trim())
    if (validOptions.length < 2) {
      setError('At least 2 options are required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorAddress,
          title: title.trim(),
          description: description.trim(),
          options: validOptions,
          durationHours: duration,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        onCreated()
      }
    } catch {
      setError('Failed to create proposal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-3xl max-w-md w-full p-7 animate-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">New proposal</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center text-lg">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Where should this month's pool go?"
              maxLength={100}
              className="input"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this proposal about?"
              maxLength={500}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Options ({options.length}/4)
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    maxLength={100}
                    className="input flex-1"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="btn-ghost px-2 text-gray-400 hover:text-red-500">
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 4 && (
              <button onClick={addOption} className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                + Add option
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Duration</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input">
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours (3 days)</option>
              <option value={168}>1 week</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3.5 text-sm">
            {loading ? 'Creating...' : 'Create proposal'}
          </button>
        </div>
      </div>
    </div>
  )
}
