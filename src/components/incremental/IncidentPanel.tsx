import { formatResourceEffect } from "@/lib/incrementalUi";
import { GameAssetImage } from "@/components/incremental/GameAssetImage";
import { getIncidentAssetId } from "@/lib/incrementalAssets";
import type { Incident } from "@/types/incremental";

export function IncidentPanel({
  incident,
  onResolve,
}: {
  incident: Incident | null;
  onResolve: (incidentId: string, choiceId: string) => void;
}) {
  if (!incident) {
    return (
      <section className="incident-card incident-card-idle">
        <h2 className="font-black">Incident actif</h2>
        <p className="handwritten mt-2">Rien à signaler. L’open-space retient son souffle pour rien.</p>
      </section>
    );
  }

  return (
    <section className="incident-card">
      <div className="flex items-start gap-3">
        <GameAssetImage
          assetId={getIncidentAssetId(incident.id)}
          alt=""
          className="incident-title-asset"
        />
        <div>
          <p className="text-xs font-black uppercase tracking-wide">Incident actif</p>
          <h2 className="text-xl font-black">{incident.title}</h2>
        </div>
      </div>
      <p className="handwritten mt-3">{incident.description}</p>

      <div className="mt-4 grid gap-2">
        {incident.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="decision-button"
            onClick={() => onResolve(incident.id, choice.id)}
          >
            <span>{choice.label}</span>
            <span className="text-xs opacity-70">
              {choice.chance ? "Effet incertain" : formatResourceEffect(choice.effect)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
