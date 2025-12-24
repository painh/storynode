import { useState, useCallback, useRef, useEffect } from 'react'

export function useMenuState() {
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [showRecentSubmenu, setShowRecentSubmenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeAllMenus = useCallback(() => {
    setShowFileMenu(false)
    setShowEditMenu(false)
    setShowViewMenu(false)
    setShowHelpMenu(false)
    setShowRecentSubmenu(false)
  }, [])

  const toggleFileMenu = useCallback(() => {
    setShowFileMenu(prev => !prev)
    setShowEditMenu(false)
    setShowViewMenu(false)
    setShowHelpMenu(false)
  }, [])

  const toggleEditMenu = useCallback(() => {
    setShowEditMenu(prev => !prev)
    setShowFileMenu(false)
    setShowViewMenu(false)
    setShowHelpMenu(false)
  }, [])

  const toggleViewMenu = useCallback(() => {
    setShowViewMenu(prev => !prev)
    setShowFileMenu(false)
    setShowEditMenu(false)
    setShowHelpMenu(false)
  }, [])

  const toggleHelpMenu = useCallback(() => {
    setShowHelpMenu(prev => !prev)
    setShowFileMenu(false)
    setShowEditMenu(false)
    setShowViewMenu(false)
  }, [])

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeAllMenus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeAllMenus])

  return {
    menuRef,
    showFileMenu,
    showEditMenu,
    showViewMenu,
    showHelpMenu,
    showRecentSubmenu,
    setShowRecentSubmenu,
    closeAllMenus,
    toggleFileMenu,
    toggleEditMenu,
    toggleViewMenu,
    toggleHelpMenu,
  }
}
