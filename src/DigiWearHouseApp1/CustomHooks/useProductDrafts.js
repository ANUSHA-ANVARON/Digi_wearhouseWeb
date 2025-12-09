// hooks/useProductDrafts.js
// Custom hook for managing product drafts in localStorage

import { useState, useCallback, useEffect } from 'react';

const DRAFTS_STORAGE_KEY = 'product_drafts';

// Generate a unique ID for each draft
const generateDraftId = () => {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useProductDrafts = () => {
    const [drafts, setDrafts] = useState([]);

    // Load drafts from localStorage on mount
    useEffect(() => {
        loadDrafts();
    }, []);

    // Load all drafts from localStorage with auto-expiration
    const loadDrafts = useCallback(() => {
        try {
            const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                const now = new Date();
                const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

                // Filter out expired drafts
                const validDrafts = parsed.filter(draft => {
                    const draftDate = new Date(draft.lastModified);
                    return (now - draftDate) < twoDaysInMs;
                });

                // If drafts were removed, update localStorage
                if (validDrafts.length < parsed.length) {
                    console.log(`Removed ${parsed.length - validDrafts.length} expired drafts`);
                    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(validDrafts));
                }

                // Sort by lastModified descending (newest first)
                const sorted = validDrafts.sort((a, b) =>
                    new Date(b.lastModified) - new Date(a.lastModified)
                );
                setDrafts(sorted);
                return sorted;
            }
            return [];
        } catch (error) {
            console.error('Error loading drafts from localStorage:', error);
            return [];
        }
    }, []);

    // Get all drafts
    const getDrafts = useCallback(() => {
        return drafts;
    }, [drafts]);

    // Get a specific draft by ID
    const getDraft = useCallback((draftId) => {
        return drafts.find(d => d.id === draftId) || null;
    }, [drafts]);

    // Save or update a draft
    const saveDraft = useCallback((draftId, formData) => {
        try {
            const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
            let allDrafts = stored ? JSON.parse(stored) : [];

            const now = new Date().toISOString();
            const existingIndex = allDrafts.findIndex(d => d.id === draftId);

            // Create draft object
            const draftData = {
                id: draftId || generateDraftId(),
                formData: formData,
                title: formData.title || 'Untitled Product',
                category: formData.category || '',
                dressType: formData.dressType || '',
                price: formData.price || '',
                createdAt: existingIndex >= 0 ? allDrafts[existingIndex].createdAt : now,
                lastModified: now,
            };

            if (existingIndex >= 0) {
                // Update existing draft
                allDrafts[existingIndex] = draftData;
            } else {
                // Add new draft
                allDrafts.push(draftData);
            }

            localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(allDrafts));
            loadDrafts(); // Refresh state

            return draftData.id;
        } catch (error) {
            console.error('Error saving draft:', error);
            return null;
        }
    }, [loadDrafts]);

    // Delete a specific draft
    const deleteDraft = useCallback((draftId) => {
        try {
            const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
            if (stored) {
                let allDrafts = JSON.parse(stored);
                allDrafts = allDrafts.filter(d => d.id !== draftId);
                localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(allDrafts));
                loadDrafts(); // Refresh state
            }
            return true;
        } catch (error) {
            console.error('Error deleting draft:', error);
            return false;
        }
    }, [loadDrafts]);

    // Clear all drafts
    const clearAllDrafts = useCallback(() => {
        try {
            localStorage.removeItem(DRAFTS_STORAGE_KEY);
            setDrafts([]);
            return true;
        } catch (error) {
            console.error('Error clearing drafts:', error);
            return false;
        }
    }, []);

    // Get draft count
    const getDraftCount = useCallback(() => {
        return drafts.length;
    }, [drafts]);

    // Create a new draft and return its ID
    const createNewDraft = useCallback(() => {
        return generateDraftId();
    }, []);

    return {
        drafts,
        getDrafts,
        getDraft,
        saveDraft,
        deleteDraft,
        clearAllDrafts,
        getDraftCount,
        createNewDraft,
        loadDrafts,
    };
};

export default useProductDrafts;
