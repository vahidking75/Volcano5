'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { PromptFields } from '../engine/promptSchema';
import { serializeFields, deserializeFields } from '../engine/promptSchema';

type ProjectRow = { id: string; name: string; data: any; updated_at?: string };

export function ProjectBar({
  fields,
  onLoad,
  onSavedVersion,
}: {
  fields: PromptFields;
  onLoad: (f: PromptFields) => void;
  onSavedVersion: (promptText: string) => void;
}) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState('My Volcano Project');
  const [msg, setMsg] = useState<string>('');

  const supaEnabled = useMemo(() => {
    return !!supabase && !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    const boot = async () => {
      if (!supabase) { setReady(true); return; }
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          setUserId(data.session.user.id);
        } else {
          const r = await supabase.auth.signInAnonymously();
          setUserId(r.data?.user?.id ?? null);
        }
      } catch (e) {
        // ignore (supabase misconfigured)
      } finally {
        setReady(true);
      }
    };
    boot();
  }, []);

  const refresh = async () => {
    if (!supabase || !userId) return;
    setMsg('');
    const { data, error } = await supabase
      .from('projects')
      .select('id,name,data,updated_at')
      .order('updated_at', { ascending: false });
    if (error) {
      setMsg('Supabase: could not load projects (check RLS + env vars).');
      return;
    }
    setProjects((data as any) ?? []);
  };

  useEffect(() => {
    if (userId) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const createProject = async () => {
    if (!supabase || !userId) return;
    setMsg('');
    const payload = serializeFields(fields);
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: userId, name, data: payload })
      .select('id')
      .single();
    if (error) { setMsg('Supabase: create failed.'); return; }
    setActiveId((data as any)?.id ?? null);
    await refresh();
    setMsg('Project created.');
  };

  const saveProject = async () => {
    if (!supabase || !userId || !activeId) return;
    setMsg('');
    const payload = serializeFields(fields);
    const { error } = await supabase
      .from('projects')
      .update({ name, data: payload, updated_at: new Date().toISOString() })
      .eq('id', activeId);
    if (error) { setMsg('Supabase: save failed.'); return; }
    setMsg('Saved.');
    await refresh();
  };

  const loadProject = async (id: string) => {
    const row = projects.find(p => p.id === id);
    if (!row) return;
    setActiveId(id);
    setName(row.name);
    onLoad(deserializeFields(row.data));
    setMsg('Loaded.');
  };

  const deleteProject = async () => {
    if (!supabase || !activeId) return;
    setMsg('');
    const { error } = await supabase.from('projects').delete().eq('id', activeId);
    if (error) { setMsg('Supabase: delete failed.'); return; }
    setActiveId(null);
    await refresh();
    setMsg('Deleted.');
  };

  const saveVersion = async () => {
    if (!supabase) return;
    if (!activeId) { setMsg('Create or select a project first.'); return; }
    const prompt = (window as any).__VOLCANO_COMPILED_PROMPT__ as string | undefined;
    if (!prompt) { setMsg('Nothing to version yet.'); return; }
    const { error } = await supabase.from('prompt_versions').insert({ project_id: activeId, prompt });
    if (error) { setMsg('Supabase: could not save version.'); return; }
    onSavedVersion(prompt);
    setMsg('Version saved.');
  };

  if (!ready) return <div className="card"><div className="mutedSmall">Loading projects…</div></div>;
  if (!supaEnabled) return <div className="card"><div className="mutedSmall">Supabase not configured. Projects disabled.</div></div>;

  return (
    <div className="card">
      <div className="rowBetween">
        <div>
          <div className="label">Projects</div>
          <div className="mutedSmall">Saved projects + versions (Supabase)</div>
        </div>
        <div className="row">
          <select className="input" value={activeId ?? ''} onChange={(e)=> loadProject(e.target.value)}>
            <option value="">Select…</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="btn" onClick={refresh}>Refresh</button>
        </div>
      </div>

      <div className="row">
        <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Project name" />
        <button className="btn" onClick={createProject}>Create</button>
        <button className="btn primary" onClick={saveProject} disabled={!activeId}>Save</button>
        <button className="btn" onClick={saveVersion} disabled={!activeId}>Save Version</button>
        <button className="btn danger" onClick={deleteProject} disabled={!activeId}>Delete</button>
      </div>

      {msg && <div className="mutedSmall">{msg}</div>}
    </div>
  );
}
