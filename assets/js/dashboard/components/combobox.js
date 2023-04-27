import React, { Fragment, useState, useCallback, useEffect, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import debounce from 'debounce-promise'
import classNames from 'classnames'

function Option({isHighlighted, isDisabled, onClick, onMouseEnter, text, id}) {
  const className = classNames('relative select-none py-2 px-3', {
    'cursor-pointer': !isDisabled,
    'text-gray-300 dark:text-gray-600': isDisabled,
    'text-gray-900 dark:text-gray-300': !isDisabled && !isHighlighted,
    'bg-indigo-600 text-white': !isDisabled && isHighlighted,
  })

  return (
    <li
      className={className}
      id={id}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="block truncate">{text}</span>
    </li>
  )
}
function scrollTo(wrapper, id) {
  if (wrapper) {
    const el = wrapper.querySelector('#' + id);

    if (el) {
      el.scrollIntoView({block: 'center'});
    }
  }
}

function optionId(index) {
  return `plausible-combobox-option-${index}`
}

export default function PlausibleCombobox(props) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef(null);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const visibleOptions = [...options]
  if (props.freeChoice && input.length > 0 && options.every(option => option.value !== input)) {
    visibleOptions.push({value: input, label: input, freeChoice: true})
  }

  function highLight(index) {
    let newIndex = index

    if (index < 0) {
      newIndex = visibleOptions.length - 1
    } else if (index >= visibleOptions.length) {
      newIndex = 0
    }

    setHighlightedIndex(newIndex)
    scrollTo(listRef.current, optionId(newIndex))
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      if (!isOpen || loading || visibleOptions.length === 0) return null
      selectOption(visibleOptions[highlightedIndex])
      e.preventDefault()
    }
    if (e.key === 'Escape') {
      if (!isOpen || loading) return null
      setOpen(false)
      searchRef.current?.focus()
      e.preventDefault()
    }
    if (e.key === 'ArrowDown') {
      if (isOpen) {
        highLight(highlightedIndex + 1)
      } else {
        setOpen(true)
      }
    }
    if (e.key === 'ArrowUp') {
      if (isOpen) {
        highLight(highlightedIndex - 1)
      } else {
        setOpen(true)
      }
    }
  }

  function isDisabled(option) {
    return props.values.some((val) => val.value === option.value)
  }

  function fetchOptions(query) {
    setLoading(true)
    setOpen(true)

    return props.fetchOptions(query).then((loadedOptions) => {
      setLoading(false)
      setHighlightedIndex(0)
      setOptions(loadedOptions)
    })
  }

  const debouncedFetchOptions = useCallback(debounce(fetchOptions, 200), [])

  function onInput(e) {
    const newInput = e.target.value
    setInput(newInput)
    debouncedFetchOptions(newInput)
  }

  function toggleOpen() {
    if (!isOpen) {
      fetchOptions(input)
      searchRef.current.focus()
    } else {
      setInput('')
      setOpen(false)
    }
  }

  function selectOption(option) {
    if (isDisabled(option)) return

    props.onSelect([...props.values, option])
    setOpen(false)
    setInput('')
    searchRef.current.focus()
  }

  function removeOption(option, e) {
    e.stopPropagation()
    const newValues = props.values.filter((val) => val.value !== option.value)
    props.onSelect(newValues)
    searchRef.current.focus()
    setOpen(false)
  }

  const handleClick = useCallback((e) => {
    if (containerRef.current && containerRef.current.contains(e.target)) return;

    setInput('')
    setOpen(false)
  })

  useEffect(() => {
    document.addEventListener("mousedown", handleClick, false);
    return () => { document.removeEventListener("mousedown", handleClick, false); }
  }, [])

  const matchesFound = !loading && visibleOptions.length > 0
  const noMatchesFound = !loading && visibleOptions.length === 0

  return (
    <div onKeyDown={onKeyDown} ref={containerRef} className="relative ml-2 w-full">
      <div onClick={toggleOpen} className={classNames('pl-2 pr-8 py-1 w-full dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500', {'border-indigo-500 ring-1 ring-indigo-500': isOpen, '': !isOpen})}>
        { props.values.map((value) => {
            return (
              <div key={value.value} className="bg-indigo-100 dark:bg-indigo-600 flex justify-between w-full rounded-sm px-2 py-0.5 m-0.5 text-sm">{value.label} <span onClick={(e) => removeOption(value, e)} className="cursor-pointer font-bold ml-1">&times;</span></div>
            )
          })
        }
        <input className="border-none py-1 px-1 p-0 w-full inline-block rounded-md focus:outline-none focus:ring-0 text-sm" ref={searchRef} value={input} style={{backgroundColor: "inherit"}} placeholder={props.placeholder} type="text" onChange={onInput}></input>
        <div className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-2">
          {!loading && <ChevronDownIcon className="h-4 w-4 text-gray-500" />}
          {loading && <Spinner />}
        </div>
      </div>
      <Transition
        as={Fragment}
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        show={isOpen}
      >
        <ul ref={listRef} className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-gray-900">
          { loading && (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
              Loading options...
            </div>
          )}
          { noMatchesFound && !props.freeChoice && (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
              No matches found in the current dashboard. Try selecting a different time range or searching for something different
            </div>
          )}
          { noMatchesFound && props.freeChoice && (
            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
              Start typing to apply filter
            </div>
          )}
          { matchesFound && (
            visibleOptions.map((option, i) => {
              const text = option.freeChoice ? `Filtrar por '${option.label}'` : option.label

              return (
                <Option
                  key={option.value}
                  id={optionId(i)}
                  isHighlighted={highlightedIndex === i}
                  isDisabled={isDisabled(option)}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                  text={text}
                />
              )
            })
          )}
        </ul>
      </Transition>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}
