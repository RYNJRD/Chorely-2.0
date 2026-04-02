import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Shirt, Smile, RotateCcw, Check, X } from "lucide-react";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import { apiFetch } from "@/lib/apiFetch";
import {
  HEAD_SUB_SECTIONS,
  CLOTHING_SUB_SECTIONS,
  AVATAR_ITEMS,
  SUB_SECTION_LABELS,
  SUB_SECTION_ICONS,
  parseAvatarConfig,
  type AvatarConfig,
  type AvatarSubSection,
} from "@/lib/avatar";
import { cn } from "@/lib/utils";
import penguinImg from "@assets/0d1f6a25-4983-496c-a1e9-cf33a6774d85_removalai_preview_1775145431205.png";
import goldSpikyHairImg from "@assets/ChatGPT_Image_Apr_2,_2026,_05_15_05_PM_1775146544794.png";

type AvatarCategory = "head" | "clothing";

const HAIR_IMAGES: Record<string, string> = {
  "gold-spiky": goldSpikyHairImg,
};

export default function Profile() {
  const { currentUser, setCurrentUser } = useStore();
  const { toast } = useToast();

  const [config, setConfig] = useState<AvatarConfig>(() =>
    parseAvatarConfig(currentUser?.avatarConfig),
  );
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>("head");
  const [activeSubSection, setActiveSubSection] = useState<AvatarSubSection>("hair");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setConfig(parseAvatarConfig(currentUser?.avatarConfig));
  }, [currentUser?.avatarConfig]);

  const mutation = useMutation({
    mutationFn: async (nextConfig: AvatarConfig) => {
      const res = await apiFetch(
        buildUrl(api.users.updateAvatar.path, { id: currentUser?.id || 0 }),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarConfig: JSON.stringify(nextConfig) }),
        },
      );
      if (!res.ok) throw new Error("Failed to save avatar");
      return res.json();
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      queryClient.invalidateQueries({
        queryKey: [api.families.getUsers.path, user.familyId],
      });
      toast({ title: "Look saved!", description: "Your character is ready." });
    },
    onError: () => {
      toast({ title: "Could not save", description: "Try again in a moment.", variant: "destructive" });
    },
  });

  if (!currentUser) return null;

  const headSections = HEAD_SUB_SECTIONS;
  const clothingSections = CLOTHING_SUB_SECTIONS;
  const currentSections = activeCategory === "head" ? headSections : clothingSections;
  const items = AVATAR_ITEMS[activeSubSection] ?? [];

  const currentHairId = config.hair ?? "none";
  const currentHairImage = currentHairId && currentHairId !== "none" ? HAIR_IMAGES[currentHairId] : null;

  function handleCategoryChange(cat: AvatarCategory) {
    setActiveCategory(cat);
    const defaultSub = cat === "head" ? headSections[0] : clothingSections[0];
    setActiveSubSection(defaultSub);
  }

  function handleReset() {
    setConfig({});
    setConfirmReset(false);
    toast({ title: "Character reset", description: "Your look has been cleared." });
  }

  function handleHairSelect(id: string) {
    if (id === "none") {
      setConfig((c) => ({ ...c, hair: null }));
    } else {
      setConfig((c) => ({ ...c, hair: id }));
    }
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background">

      {/* ── Slim top bar ── */}
      <div className="flex-none flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-base font-black text-primary tracking-tight">My Character</h1>

        <AnimatePresence mode="wait">
          {confirmReset ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs font-bold text-muted-foreground">Reset look?</span>
              <button
                data-testid="button-confirm-reset"
                onClick={handleReset}
                className="flex items-center gap-1 bg-destructive text-destructive-foreground rounded-xl h-8 px-3 text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5" />
                Yes
              </button>
              <button
                data-testid="button-cancel-reset"
                onClick={() => setConfirmReset(false)}
                className="flex items-center gap-1 bg-muted text-muted-foreground rounded-xl h-8 px-3 text-xs font-bold hover:bg-muted/80"
              >
                <X className="w-3.5 h-3.5" />
                No
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <button
                data-testid="button-undo-avatar"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground rounded-xl h-8 px-3 text-xs font-bold border border-border/60 hover:bg-muted/60 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Undo
              </button>
              <Button
                size="sm"
                data-testid="button-save-avatar"
                onClick={() => mutation.mutate(config)}
                disabled={mutation.isPending}
                className="rounded-xl font-bold h-8 px-3 text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Character preview ── */}
      <div
        className="flex-none relative flex items-end justify-center bg-gradient-to-b from-primary/8 via-background/50 to-background overflow-hidden"
        style={{ height: "38vh" }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-primary/10 rounded-full blur-3xl" />

        {/* Stacked character: penguin base + hair overlay */}
        <div className="relative h-full flex items-end justify-center z-10">
          <img
            src={penguinImg}
            alt="Character"
            draggable={false}
            className="h-full w-auto object-contain object-bottom select-none pointer-events-none drop-shadow-2xl"
          />
          <AnimatePresence>
            {currentHairImage && (
              <motion.img
                key={currentHairId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={currentHairImage}
                alt="Hair"
                draggable={false}
                className="absolute select-none pointer-events-none"
                style={{
                  top: "-8%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  height: "47%",
                  width: "auto",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Wardrobe panel ── */}
      <div className="flex-1 min-h-0 flex flex-col bg-card rounded-t-[2rem] shadow-2xl border-t border-border/60 overflow-hidden">

        {/* Main category pills */}
        <div className="flex-none px-4 pt-4 pb-0">
          <div className="flex gap-2 bg-muted/60 rounded-2xl p-1">
            {(["head", "clothing"] as AvatarCategory[]).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  data-testid={`tab-category-${cat}`}
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cat === "head" ? (
                    <Smile className="w-4 h-4" />
                  ) : (
                    <Shirt className="w-4 h-4" />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-section tabs — horizontal scroll */}
        <div className="flex-none pt-3 pb-1">
          <div className="flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
            {currentSections.map((sub) => {
              const isActive = activeSubSection === sub;
              return (
                <button
                  key={sub}
                  data-testid={`tab-subsection-${sub}`}
                  onClick={() => setActiveSubSection(sub)}
                  className={cn(
                    "flex-none flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                    isActive
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <span className="text-base leading-none">{SUB_SECTION_ICONS[sub]}</span>
                  <span>{SUB_SECTION_LABELS[sub]}</span>
                </button>
              );
            })}
          </div>
          <div className="mx-4 mt-1 h-px bg-border/60" />
        </div>

        {/* Items area — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">
          {items.length === 0 ? (
            <motion.div
              key={activeSubSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-5xl mb-4 opacity-40">{SUB_SECTION_ICONS[activeSubSection]}</div>
              <p className="font-black text-base text-foreground/30 uppercase tracking-widest mb-1">
                Coming soon
              </p>
              <p className="text-xs text-muted-foreground/60 font-medium max-w-[200px]">
                {SUB_SECTION_LABELS[activeSubSection]} options are on their way!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeSubSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 gap-3 pt-3"
            >
              {items.map((item) => {
                const isHair = activeSubSection === "hair";
                const isNone = item.id === "none";
                const isSelected = isHair
                  ? isNone
                    ? !config.hair || config.hair === "none"
                    : config[activeSubSection] === item.id
                  : config[activeSubSection] === item.id;

                return (
                  <button
                    key={item.id}
                    data-testid={`item-${activeSubSection}-${item.id}`}
                    onClick={() =>
                      isHair ? handleHairSelect(item.id) : setConfig((c) => ({ ...c, [activeSubSection]: item.id }))
                    }
                    className={cn(
                      "relative aspect-square rounded-2xl border-2 overflow-hidden transition-all",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border/60 hover:border-primary/30 bg-muted/40",
                    )}
                  >
                    {isNone ? (
                      /* "Nothing" tile: show penguin head, cropped to top */
                      <img
                        src={penguinImg}
                        alt="No hair"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: "50% 10%" }}
                      />
                    ) : isHair && HAIR_IMAGES[item.id] ? (
                      /* Hair item: show just the hair image, no label */
                      <img
                        src={HAIR_IMAGES[item.id]}
                        alt={item.label}
                        className="w-full h-full object-contain p-3"
                      />
                    ) : (
                      /* Generic item with label */
                      <>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-contain p-2"
                          />
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm py-1 px-2">
                          <p className="text-[10px] font-bold truncate text-center">{item.label}</p>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
