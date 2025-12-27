'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n-provider';

interface Note {
    _id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface VehicleNotesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    watchlistItemId: string;
    vehicleName: string;
}

export function VehicleNotesModal({
    open,
    onOpenChange,
    watchlistItemId,
    vehicleName,
}: VehicleNotesModalProps) {
    const { t, locale } = useI18n();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');

    const MAX_CHARS = 1000;

    useEffect(() => {
        if (open) {
            fetchNotes();
        }
    }, [open, watchlistItemId]);

    const fetchNotes = async () => {
        if (!watchlistItemId || watchlistItemId === 'undefined') {
            console.error('Invalid watchlistItemId:', watchlistItemId);
            toast.error('This vehicle needs to be re-saved to use notes. Please remove and add it again.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/watchlist/notes/item/${watchlistItemId}`;
            console.log('Fetching notes from:', apiUrl);
            console.log('WatchlistItemId:', watchlistItemId);

            const response = await fetch(apiUrl, {
                credentials: 'include',
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error('Failed to fetch notes');
            }

            const result = await response.json();
            console.log('Fetched notes:', result);
            setNotes(result.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error(t('notes.fetchError') || 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newNoteContent.trim()) {
            toast.error(t('notes.emptyError') || 'Note cannot be empty');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/watchlist/notes`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        watchlistItemId,
                        content: newNoteContent,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to create note');

            const result = await response.json();
            setNotes([result.data, ...notes]);
            setNewNoteContent('');
            setIsCreating(false);
            toast.success(t('notes.createSuccess') || 'Note created successfully');
        } catch {
            toast.error(t('notes.createError') || 'Failed to create note');
        }
    };

    const handleUpdate = async (noteId: string) => {
        if (!editContent.trim()) {
            toast.error(t('notes.emptyError') || 'Note cannot be empty');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/watchlist/notes/${noteId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        content: editContent,
                    }),
                }
            );

            if (!response.ok) throw new Error('Failed to update note');

            const result = await response.json();
            setNotes(notes.map((n) => (n._id === noteId ? result.data : n)));
            setEditingId(null);
            setEditContent('');
            toast.success(t('notes.updateSuccess') || 'Note updated successfully');
        } catch {
            toast.error(t('notes.updateError') || 'Failed to update note');
        }
    };

    const handleDelete = async (noteId: string) => {
        if (!confirm(t('notes.deleteConfirm') || 'Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/watchlist/notes/${noteId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) throw new Error('Failed to delete note');

            setNotes(notes.filter((n) => n._id !== noteId));
            toast.success(t('notes.deleteSuccess') || 'Note deleted successfully');
        } catch {
            toast.error(t('notes.deleteError') || 'Failed to delete note');
        }
    };

    const startEdit = (note: Note) => {
        setEditingId(note._id);
        setEditContent(note.content);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(locale === 'he' ? 'he-IL' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {t('notes.title') || 'Notes'} - {vehicleName}
                    </DialogTitle>
                </DialogHeader>

                {/* Add New Note Section - Fixed at top */}
                <div className="px-6 pb-4">
                    {isCreating ? (
                        <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                            <Textarea
                                value={newNoteContent}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value.slice(0, MAX_CHARS))}
                                placeholder={t('notes.placeholder') || 'Write your note here...'}
                                className="min-h-[100px] resize-none"
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {newNoteContent.length} / {MAX_CHARS}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewNoteContent('');
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        {t('notes.cancel') || 'Cancel'}
                                    </Button>
                                    <Button size="sm" onClick={handleCreate}>
                                        <Check className="h-4 w-4 mr-1" />
                                        {t('notes.save') || 'Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="w-full"
                            variant="outline"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('notes.addNew') || 'Add New Note'}
                        </Button>
                    )}
                </div>

                {/* Notes List - Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-slate-800 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 dark:[&::-webkit-scrollbar-thumb]:hover:bg-slate-500">{/* Notes List */}
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('notes.loading') || 'Loading notes...'}
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {t('notes.empty') || 'No notes yet. Add your first note!'}
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note._id} className="border rounded-lg p-4 space-y-3">
                                {editingId === note._id ? (
                                    <>
                                        <Textarea
                                            value={editContent}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value.slice(0, MAX_CHARS))}
                                            className="min-h-[100px] resize-none"
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                {editContent.length} / {MAX_CHARS}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                    <X className="h-4 w-4 mr-1" />
                                                    {t('notes.cancel') || 'Cancel'}
                                                </Button>
                                                <Button size="sm" onClick={() => handleUpdate(note._id)}>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    {t('notes.save') || 'Save'}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="whitespace-pre-wrap">{note.content}</p>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{formatDate(note.updatedAt)}</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => startEdit(note)}
                                                >
                                                    {t('notes.edit') || 'Edit'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(note._id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
