drop view if exists public.ranking_view;
create view public.ranking_view as
select
  p.id as user_id,
  p.username,
  p.avatar_url,
  coalesce(min(pr.created_at), p.created_at) as first_prediction_at,
  coalesce(sum(coalesce(pr.points_earned, 0)), 0)::int as total_points,
  count(pr.id)::int as total_predictions,
  count(
    case
      -- Conta placar exato somente quando o jogo ja tem resultado final.
      when g.is_finished = true
        and g.home_score is not null
        and g.away_score is not null
        and pr.predicted_home_score = g.home_score
        and pr.predicted_away_score = g.away_score
      then 1
    end
  )::int as exact_scores,
  count(
    case
      when g.is_finished = true
        and g.home_score is not null
        and g.away_score is not null
        and pr.predicted_home_score = g.home_score
        and pr.predicted_away_score = g.away_score
        and (g.home_team in ('Estados Unidos', 'México', 'Canadá') or g.away_team in ('Estados Unidos', 'México', 'Canadá'))
      then 1
    end
  )::int as exact_scores_hosts,
  count(
    case
      when g.is_finished = true
        and g.home_score is not null
        and g.away_score is not null
        and pr.predicted_home_score = g.home_score
        and pr.predicted_away_score = g.away_score
        and (g.home_team = 'Brasil' or g.away_team = 'Brasil')
      then 1
    end
  )::int as exact_scores_brazil,
  count(case when coalesce(pr.points_earned, 0) > 0 then 1 end)::int as correct_predictions,
  rank() over (
    order by
      coalesce(sum(coalesce(pr.points_earned, 0)), 0) desc,
      count(
        case
          when g.is_finished = true
            and g.home_score is not null
            and g.away_score is not null
            and pr.predicted_home_score = g.home_score
            and pr.predicted_away_score = g.away_score
          then 1
        end
      ) desc,
      count(
        case
          when g.is_finished = true
            and g.home_score is not null
            and g.away_score is not null
            and pr.predicted_home_score = g.home_score
            and pr.predicted_away_score = g.away_score
            and (g.home_team in ('Estados Unidos', 'México', 'Canadá') or g.away_team in ('Estados Unidos', 'México', 'Canadá'))
          then 1
        end
      ) desc,
      count(
        case
          when g.is_finished = true
            and g.home_score is not null
            and g.away_score is not null
            and pr.predicted_home_score = g.home_score
            and pr.predicted_away_score = g.away_score
            and (g.home_team = 'Brasil' or g.away_team = 'Brasil')
          then 1
        end
      ) desc,
      coalesce(min(pr.created_at), p.created_at) asc,
      p.username asc
  )::int as position
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
left join public.games g on g.id = pr.game_id
where p.is_paid = true
group by p.id, p.username, p.avatar_url, p.created_at
order by total_points desc, exact_scores desc, exact_scores_hosts desc, exact_scores_brazil desc, first_prediction_at asc, p.username asc;

grant select on public.ranking_view to authenticated;
